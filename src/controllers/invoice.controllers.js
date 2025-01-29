const Invoice = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const processItems = require("../middlewares/invoice.middleware");
const processPayments = require("../middlewares/payment.middleware");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");




// Create Invoice
const createInvoice = async (req, res, next) => {
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
        const finalCustomerId = (billTo === "Cash" ? "6790a5b3d50038409a777e3d" : customerId);
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
  };

// Endpoint to fetch the last invoice


module.exports = { createInvoice, lastInvoiceDatails };