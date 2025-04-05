import { Invoice } from "../models/invoice.model.js";
import { Customer } from "../models/customer.model.js";
import { Account } from "../models/account.model.js";
import { processItems } from "../middlewares/invoice.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// Generate invoice number
const generateInvoiceNumber = async () => {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
    return `INV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

// Endpoint to fetch the last invoice
const fetchLastInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });

        if (lastInvoice) {
            res.status(201).json(
                new ApiResponse(201, { lastInvoice }, "Invoice created successfully.")
            )
          } else {
            res.status(404).json({ message: 'No invoices found' });
          }
    } catch (error) {
        next(error);
    }
});

// Create Invoice
const createInvoice = asyncHandler( async (req, res, next) => {
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
            paymentMode,
            receivedAmount,
            type,
            transactionId,
            privateNote,
            customerNote,
            soldBy,
            deliveryTerm,
          } = req.body;

        if (!items || items.length === 0) {
            throw new ApiError(400, "Item details are required.");
        }     

        const finalCustomerId = billTo === "Cash" ? process.env.CASH_ACCOUNT_ID : customerId;
        const customer = await Customer.findById(finalCustomerId);
        if (!customer) {
            throw new ApiError(404, "Customer not found.");
        }


        const account = await Account.findOne({ accountName: paymentMode });
        if (!account) {
            throw new ApiError(404, `${paymentMode} Account not found, please create account first.`);
        }

        // Create the invoice (not saved yet)
        const newInvoice = new Invoice({
            invoiceType,
            invoiceNumber: invoiceNumber ? invoiceNumber : await generateInvoiceNumber(),
            date,
            dueDate,
            placeOfSupply,
            billTo,
            customer: finalCustomerId,
            customerName,
            mobileNumber,
            address,
            discountAmount,
            paymentAccount:account._id,
            paymentDate,
            privateNote,
            customerNote,
            deliveryTerm,
            soldBy: soldBy ? soldBy : req.user._id,
        });

        // Process items and get total amount
        const { itemDetails, totalAmount } = await processItems(items, newInvoice._id);

        newInvoice.items = itemDetails;
        newInvoice.totalAmount = totalAmount;
        newInvoice.totalPayableAmount = totalAmount - discountAmount;
        newInvoice.receivedAmount = receivedAmount;
        newInvoice.dueAmount = newInvoice.totalPayableAmount - receivedAmount;
        newInvoice.status = newInvoice.dueAmount === 0 
            ? "paid" 
            : receivedAmount > 0 
                ? "partially_paid" 
                : "unpaid";

        // Save the invoice
        await newInvoice.save();

        // Update account balance (credit)
        account.balance = Number(account.balance) + Number(receivedAmount);
        account.transactions.push({
            type: type ? type : "credit",
            amount:receivedAmount,
            description:"",
            date:paymentDate,
            referenceId:"",
            transactionId:transactionId,
            invoiceId:newInvoice._id,
            paymentMode:paymentMode,
        })
        await account.save();

        // Update customer's purchase history
        customer.purchaseHistory.push({
            invoiceId: newInvoice._id,
            date: newInvoice.date,
            totalAmount: newInvoice.totalPayableAmount,
        });
        customer.balance = (customer.balance || 0) + newInvoice.dueAmount;
        await customer.save();

        // Update user's sales history
        req.user.saleHistory.push({
            invoiceId: newInvoice._id,
            date: newInvoice.date,
            totalAmount: newInvoice.totalPayableAmount,
        });
        await req.user.save();

        res.status(201).json(new ApiResponse(201, { newInvoice }, "Invoice created successfully."));
    } catch (error) {
        next(error);
    }
});


// Endpoint to fetch invoices
const fetchAllInvoice = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {        
        const invoices = await Invoice.find().skip(skip).limit(limit);
        const total = await Invoice.countDocuments();
        if (invoices) {
            res.status(200).json(
                new ApiResponse(201, { invoices, total, page, limit }, "Invoice fetched successfully.")
            )
          } else {
            res.status(404).json({ message: 'No invoices found' });
          }
    } catch (error) {
        next(error);
    }
});

// Endpoint to fetch invoice by id
const fetchInvoiceByID = asyncHandler( async (req, res, next) =>{
    try {        
        const invoice = await Invoice.findById(req.params.id);
        if (invoice) {
            res.status(200).json(
                new ApiResponse(201, { invoice }, "Invoice fetched successfully.")
            )
          } else {
            res.status(404).json({ message: 'No invoices found' });
          }
    } catch (error) {
        next(error);
    }
});

// search invoice
const searchInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        // Case-insensitive search for matching names
        const invoices = await Invoice.find({
            $or: [
                { invoiceNumber: { $regex: search, $options: "i" }, }, 
                { customerName:{ $regex: search, $options: "i" } },
                { mobileNumber:{ $regex: search, $options: "i" } }, 
                { billTo:{ $regex: search, $options: "i" } }
            ],
              
            }).limit(20);

        if (invoices.length < 0) {
            throw new ApiError(400, "No invoice found" );
          }

        res.status(200).json(new ApiResponse(200, invoices, "Invoices Fetched"));

    } catch (error) {
        next(error);
    }
});


// update invoice by id
const updateInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        const invoice = await Invoice.findById(id);
          if (!invoice) {
              throw new ApiError(404, "Invoice not found.");
          }
        
        const updatedInvoice = await Invoice.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedInvoice) {
              throw new ApiError(500, "Failed to update invoice");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedInvoice, "Invoice updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


// delete invoice
const deleteInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedInvoice = await Invoice.findByIdAndDelete(id);

        if (!deletedInvoice) {
                throw new ApiError(404, "Invoice not found, please select a correct invoice");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Invoice deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});


export { 
    fetchLastInvoice,
    createInvoice, 
    fetchAllInvoice, 
    fetchInvoiceByID, 
    searchInvoice, 
    updateInvoice, 
    deleteInvoice
};