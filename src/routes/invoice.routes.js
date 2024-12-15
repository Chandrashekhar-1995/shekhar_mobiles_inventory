 const express = require("express");
 const invoiceRouter = express.Router();
 const { authenticateUser } = require("../middlewares/auth.middleware");
 const Invoice = require("../models/invoice.model");
 const Account = require("../models/account.model");
 const Customer = require("../models/customer.model");
 const Product = require("../models/Product.model");
 const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// gfenerate invoice number
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
  return `INV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

 
// create invoice
invoiceRouter.post("/invoice/create", authenticateUser, async (req, res, next)=>{
  try {
    const { 
      invoiceNumber, 
      invoiceType,
      date,
      dueDate,
      billTo,
      customerId,
      items,
      discountAmount = 0,
      payments = [],
      privateNote,
      soldBy,
      deliveryTerm,
        } = req.body;

    if(!customerId || !items){
      throw new ApiError(400, "customer and items details are required.");
    };

    // Validate customer existence
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

   // Calculate total amount and validate items
   let totalAmount = 0;
   const itemDetails = [];
   for (const item of items) {
       const product = await Product.findById(item.item);
       if (!product) {
           return res.status(404).json({ message: `Item with ID ${item.item} not found.` });
       }

       const itemTotal = item.quantity * item.salePrice;
       totalAmount += itemTotal;
       itemDetails.push({
           item: item.item,
           quantity: item.quantity,
           salePrice: item.salePrice,
           total: itemTotal,
       });
   }

   // Apply discount
   totalAmount -= discountAmount;

    // Process received payments
    let receivedAmount = 0;
    const paymentDetails = [];
    for (const payment of payments || []) {
        const account = await Account.findById(payment.accountId);
        if (!account) {
            return res.status(404).json({ message: `Account with ID ${payment.accountId} not found.` });
        }

        // Ensure payment doesn't exceed due amount
        if (receivedAmount + payment.amount > totalAmount) {
            return res.status(400).json({
                message: `Received payment exceeds total invoice amount. Allowed amount: ${totalAmount - receivedAmount}`,
            });
        }

        // Credit the account (add received amount to balance)
        account.updateBalance("Credit", payment.amount);
        await account.save();

        paymentDetails.push({
            accountId: payment.accountId,
            amount: payment.amount,
        });

        receivedAmount += payment.amount;
    }

    // Calculate due amount and set status
    const dueAmount = totalAmount - receivedAmount;
    const status = dueAmount === 0 ? "Paid" : receivedAmount > 0 ? "Partially Paid" : "Unpaid";


    // Create the invoice
    const newInvoice = new Invoice({
      invoiceType,
      invoiceNumber: invoiceNumber ? invoiceNumber : generateInvoiceNumber(),
      date, 
      dueDate, 
      billTo,
      customerId,
      items: itemDetails,
      discountAmount, 
      totalAmount,
      receivedAmount,
      dueAmount, 
      status,
      payments: paymentDetails,
      privateNote, 
      deliveryTerm,
      soldBy:soldBy ? soldBy : req.user._id,
    });

    await newInvoice.save();
    new ApiResponse(201, invoice, "Invoice created successfully.")
  } catch (err) {
      next(err);
  }
});

 module.exports = invoiceRouter;