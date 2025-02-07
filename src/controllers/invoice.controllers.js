const Invoice = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const processItems = require("../middlewares/invoice.middleware");
const processPayments = require("../middlewares/payment.middleware");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Generate invoice number
const generateInvoiceNumber = async () => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
    return `INV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

// Create Invoice
const createInvoice = async (req, res, next) => {
    try {
        const {
            invoiceType = "Non GST",
            invoiceNumber,
            date = new Date(),
            dueDate = new Date(),
            placeOfSupply = "Uttar Pradesh",
            billTo,
            customerId,
            customerName,
            mobileNumber,
            address,
            items,
            discountAmount = 0,
            payments = [],
            privateNote,
            deliveryTerm,
            soldBy,
        } = req.body;

        if (!items || items.length === 0) {
            throw new ApiError(400, "Item details are required.");
        }

        // Assign default customer ID for cash sales
        const finalCustomerId = billTo === "Cash" ? "6790a5b3d50038409a777e3d" : customerId;
        const customer = await Customer.findById(finalCustomerId);
        if (!customer) {
            throw new ApiError(404, "Customer not found.");
        }

        // Process items
        const { itemDetails, totalAmount: calculatedTotal } = await processItems(items);
        const totalAmount = calculatedTotal;
        const totalPayableAmount = totalAmount - discountAmount;

        // Process payments
        const { receivedAmount, paymentDetails } = await processPayments(payments, totalAmount, customer);
        const paymentAccount = payments.length > 0 ? payments[0].accountId : null;

        // Calculate due amount and set invoice status
        const dueAmount = totalPayableAmount - receivedAmount;
        const status = dueAmount === 0 ? "Paid" : receivedAmount > 0 ? "Partially Paid" : "Unpaid";

        // Create the invoice
        const newInvoice = new Invoice({
            invoiceType,
            invoiceNumber: invoiceNumber || await generateInvoiceNumber(),
            date,
            dueDate,
            placeOfSupply,
            billTo,
            customer: finalCustomerId,
            customerName: customerName || customer.name,
            mobileNumber: mobileNumber || customer.mobileNumber,
            address: address || customer.address,
            items: itemDetails,
            totalAmount,
            discountAmount,
            totalPayableAmount,
            receivedAmount,
            status,
            paymentAccount,
            privateNote,
            deliveryTerm,
            soldBy: soldBy || req.user._id,
        });

        await newInvoice.save();

        // Update customer's purchase history
        customer.purchaseHistory.push({
            invoiceId: newInvoice._id,
            date: newInvoice.date,
            totalAmount: newInvoice.totalPayableAmount,
        });
        await customer.save();

        // Update user's sales history
        req.user.saleHistory.push({
            invoiceId: newInvoice._id,
            date: newInvoice.date,
            totalAmount: newInvoice.totalPayableAmount,
        });
        await req.user.save();

        res.status(201).json(new ApiResponse(201, { newInvoice }, "Invoice created successfully."));
    } catch (err) {
        next(err);
    }
};


// Endpoint to fetch the last invoice
const lastInvoiceFetch = async (req, res, next) =>{
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
};

module.exports = { createInvoice, lastInvoiceFetch};