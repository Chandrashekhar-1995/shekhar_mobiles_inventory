const Invoice = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const Account = require("../models/account.model");
const {processItems} = require("../middlewares/invoice.middleware");
const {processPayments} = require("../middlewares/payment.middleware");
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
            invoiceType,
            invoiceNumber,
            date,
            dueDate,
            placeOfSupply,
            billTo,
            customerId,
            customerName,
            mobileNumber,
            address,
            items,
            discountAmount,
            paymentDate,
            paymentAccount,
            receivedAmount,
            privateNote,
            customerNote,
            soldBy,
            deliveryTerm,
          } = req.body;

        if (!items || items.length === 0) {
            throw new ApiError(400, "Item details are required.");
        }        

        const finalCustomerId = billTo === "Cash" ? "6790a5b3d50038409a777e3d" : customerId;
        const customer = await Customer.findById(finalCustomerId);
        if (!customer) {
            throw new ApiError(404, "Customer not found.");
        }

        const { itemDetails, totalAmount } = await processItems(items);

        const totalPayableAmount = totalAmount - discountAmount;

        const dueAmount = totalPayableAmount - receivedAmount;

        // Calculate invoice status
        const status = dueAmount === 0 ? "Paid" : receivedAmount > 0 ? "Partially Paid" : "Unpaid";

        const account = await Account.findOne({ accountName: paymentAccount });
        if (!account) {
            throw new ApiError(404, `${paymentAccount} Account not found, please create account first.`);
        }

        // Create the invoice
        const newInvoice = new Invoice({
            invoiceType,
            invoiceNumber: invoiceNumber ? invoiceNumber : await generateInvoiceNumber (),
            date,
            dueDate,
            placeOfSupply,
            billTo,
            customer: finalCustomerId,
            customerName,
            mobileNumber,
            address,
            items: itemDetails,
            totalAmount,
            discountAmount,
            totalPayableAmount,
            paymentDate,
            paymentAccount: account._id,
            receivedAmount,
            dueAmount,
            status,
            privateNote,
            customerNote,
            deliveryTerm,
            soldBy: soldBy ? soldBy : req.user._id,
          });
      
          await newInvoice.save();

        // Update account balance (credit)
        account.balance = Number(account.balance) + Number(receivedAmount);
        await account.save();

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

        customer.balance = (customer.balance || 0) + balanceDifference;
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