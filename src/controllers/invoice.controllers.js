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

        if (!lastInvoice) {
            throw new ApiError(404, "No invoice found.");
          } 
        
        res.status(201).json(
            new ApiResponse(200, { lastInvoice }, "Invoice fetched successfully.")
        )
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

        const finalBillTo = billTo.toLowerCase();
        const finalCustomerId = finalBillTo === "cash" ? process.env.CASH_CUSTOMER_ID : customerId;
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
            billTo : billTo.toLowerCase(),
            customer: finalCustomerId,
            discountAmount,
            paymentAccount:account._id,
            receivedAmount,
            paymentDate,
            privateNote,
            customerNote,
            deliveryTerm,
            discountAmount,
            soldBy: soldBy ? soldBy : req.user._id,
        });

        // Process items and get total amount
        const { itemDetails, totalAmount } = await processItems(items, newInvoice._id);

        newInvoice.items = itemDetails;
        newInvoice.totalAmount = totalAmount;
        newInvoice.totalPayableAmount = totalAmount - discountAmount;
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
            paymentMode:paymentMode.toLowerCase(),
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
        const invoices = await Invoice.find()
        .populate({ path: "customer", select: "name mobileNumber address" })
        .populate({ path: "items.item", select: "productName itemCode unit salePrice mrp" })
        .populate({ path: "soldBy", select: "name" })
        .populate({ path: "paymentAccount", select: "accountName" })
        .skip(skip)
        // .limit(limit);
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

// Last 90 days ka sales data
const getLast90DaysSales = asyncHandler(async (req, res, next) => {
    try {
      const salesData = await Invoice.getDailySalesData(90);
      res.status(200).json(
        new ApiResponse(200, salesData, "90 days sales data fetched")
      );
    } catch (error) {
      next(error);
    }
  });
  
// Aaj ka sales summary
const getTodaySalesSummary = asyncHandler(async (req, res, next) => {
    try {
      const [result] = await Invoice.getTodaySalesSummary();
      const summary = result ? result : { totalSales: 0, invoiceCount: 0 };
      
      res.status(200).json(
        new ApiResponse(200, summary, "Today's sales summary")
      );
    } catch (error) {
      next(error);
    }
  });


// Endpoint to fetch invoice by id
const fetchInvoiceByID = asyncHandler( async (req, res, next) =>{
    try {        
        const invoice = await Invoice.findById(req.params.id)
        .populate({ path: "customer", select: "name mobileNumber address" })
        .populate({ path: "items.item", select: "productName itemCode unit salePrice mrp" })
        .populate({ path: "soldBy", select: "name" })
        .populate({ path: "paymentAccount", select: "accountName" })

        if (invoice) {
            res.status(200).json(
                new ApiResponse(201, invoice, "Invoice fetched successfully.")
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!search) {
        throw new ApiError(400, "Search Query is required." );
    }
    try { 
        const invoices = await Invoice.find({
            $or: [
                { invoiceNumber: { $regex: search, $options: "i" }, }, 
                { customerName:{ $regex: search, $options: "i" } },
                { mobileNumber:{ $regex: search, $options: "i" } }, 
                { billTo:{ $regex: search, $options: "i" } }
            ],
              
            })
            .populate({ path: "customer", select: "name mobileNumber address" })
            .populate({ path: "items.item", select: "productName itemCode unit salePrice mrp" })
            .populate({ path: "soldBy", select: "name" })
            .populate({ path: "paymentAccount", select: "accountName" })
            .skip(skip)
            // .limit(limit);
            const total = await Invoice.countDocuments();

            if(invoices){
                res.status(200).json(new ApiResponse(200, {invoices, total, page, limit}, "Invoices Fetched"));
            } else{
                throw new ApiError(400, "No invoice found" );
            }

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
    getLast90DaysSales,
    getTodaySalesSummary,
    fetchInvoiceByID, 
    searchInvoice, 
    updateInvoice, 
    deleteInvoice,
};