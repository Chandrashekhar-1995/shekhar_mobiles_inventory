const express = require("express");
const invoiceRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const Customer = require("../models/customer.model");
const Invoice = require("../models/invoice.model");
const processItems = require("../middlewares/invoice.middleware");
const processPayments = require("../middlewares/payment.middleware");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");


// gfenerate invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
  return `INV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};



invoiceRouter.post("/invoice/create", authenticateUser, async (req, res, next) => {
  try {
      const {
          invoiceNumber,
          invoiceType,
          date,
          dueDate,
          placeOfSupply,
          billTo,
          customerId,
          items,
          discountAmount = 0,
          payments = [], // Payment details
          privateNote,
          soldBy,
          deliveryTerm,
      } = req.body;

      if ( !items || items.length === 0) {
          throw new ApiError(400, "Item details are required.");
      }

     // Set the customer ID based on `billTo`
     const finalCustomerId = billTo === "Cash" ? "676397bdc6bf8d062aa4893c" : customerId;

     // Validate customer existence
     const customer = await Customer.findById(finalCustomerId);
     if (!customer) {
         throw new ApiError(404, "Customer not found.");
     }

      // Process items
      const { itemDetails, totalAmount: calculatedTotal } = await processItems(items);

      // Total bill amount
      const totalAmount = calculatedTotal;

      // Apply discount
      const totalPayableAmount = calculatedTotal - discountAmount;

      // Process payments
      const { receivedAmount, paymentDetails } = await processPayments(payments, totalAmount, customer);

      // Extract payment account from the first payment (if provided)
      const paymentAccount = payments.length > 0 ? payments[0].accountId : null;

      // Calculate due amount and set invoice status
      const dueAmount = totalAmount - receivedAmount;
      const status = dueAmount === 0 ? "Paid" : receivedAmount > 0 ? "Partially Paid" : "Unpaid";

      // Create the invoice
      const newInvoice = new Invoice({
          invoiceType,
          invoiceNumber: invoiceNumber ? invoiceNumber : await generateInvoiceNumber(),
          date,
          dueDate,
          placeOfSupply,
          billTo,
          customer:finalCustomerId,
          items: itemDetails,
          discountAmount,
          totalAmount,
          totalPayableAmount,
          receivedAmount,
          dueAmount,
          status,
          payments: paymentDetails,
          paymentAccount, // Save payment account ID
          privateNote,
          deliveryTerm,
          soldBy: soldBy ? soldBy : req.user._id,
      });

      await newInvoice.save();

      // Update customer's purchase history
      customer.purchaseHistory.push({
        invoiceId: newInvoice._id,
        date: newInvoice.date,
        totalAmount: newInvoice.totalPayableAmount,
    });
    await customer.save();

    // Update users's sales history
    req.user.saleHistory.push({
        invoiceId: newInvoice._id,
        date: newInvoice.date,
        totalAmount: newInvoice.totalPayableAmount,
    });
    await req.user.save();

      res.status(201).json(
          new ApiResponse(201, { newInvoice }, "Invoice created successfully.")
      );
  } catch (err) {
      next(err);
  }
});

// Endpoint to fetch the last invoice
invoiceRouter.get("/invoice/last-invoice", async (req, res, next) =>{
    try {
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });

        if (lastInvoice) {
            res.status(201).json(
                new ApiResponse(201, { lastInvoice }, "Invoice created successfully.")
            )
          } else {
            res.status(404).json({ message: 'No invoices found' });
          }
    } catch (err) {
        next(err);
    }
});


module.exports = invoiceRouter;