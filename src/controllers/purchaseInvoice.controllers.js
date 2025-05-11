import { PurchaseInvoice } from "../models/purchaseInvoice.model.js";
import { Customer } from "../models/customer.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { processItems } from "../middlewares/purchaseInvoice.middleware.js";

const generatePurchaseInvoiceNumber = async () => {
    const lastInvoice = await PurchaseInvoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
    return `PINV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};


const fetchLastPurchaseInvoice = asyncHandler( async (req, res, next) => {
    try {
        const lastPurchaseInvoice = await PurchaseInvoice.findOne().sort({ createdAt: -1 });
        if (!lastPurchaseInvoice) {
            throw new ApiError(404, "No purchase invoice found.");
        } 

        res.status(200).json(new ApiResponse(200, { lastPurchaseInvoice }, "Last purchase invoice fetched successfully."));
    } catch (error) {
        next(error);
    }
});

const createPurchaseInvoice = asyncHandler( async (req, res, next) => {
    try {
        const {
            invoiceType,
            invoiceNumber,
            date,
            dueDate,
            placeOfSupply,
            billFrom,
            customerId,
            items, /// todo
            discountAmount,
            paymentDate,
            paymentMode,
            receivedAmount,
            transactionId,
            privateNote,
            supplierNote,
            soldBy,
            deliveryTerm,
            srNumber
        } = req.body;

        if (!items || items.length === 0) {
            throw new ApiError(400, "Item details are required.");
        }

        const finalBillFrom = billFrom.toLowerCase();
        const finalSupplierId = finalBillFrom === "cash" ? process.env.CASH_CUSTOMER_ID : customerId;        ;
        const extingSupplier = await Customer.findById(finalSupplierId);
        if (!extingSupplier) {
            throw new ApiError(404, "Supplier not found.");
        }
        
        if(!extingSupplier.designation==="supplier"){
            throw new ApiError(400, "Selected customer is not a supplier.");
        }

        const newPurchaseInvoice = new PurchaseInvoice({
            invoiceType,
            invoiceNumber: invoiceNumber ? invoiceNumber : await generatePurchaseInvoiceNumber(),
            date,
            dueDate,
            placeOfSupply,
            billFrom:finalBillFrom,
            supplier: finalSupplierId,
            discountAmount,
            paymentDate,
            paymentMode,
            receivedAmount,
            transactionId,
            privateNote,
            supplierNote,
            purchaseBy: soldBy ? soldBy : req.user._id,
            deliveryTerm,
            srNumber
        });

        const result = await processItems(items, newPurchaseInvoice._id);
        const { itemDetails, totalAmount } = result;

        newPurchaseInvoice.items = itemDetails;
        newPurchaseInvoice.totalAmount = totalAmount;
        newPurchaseInvoice.totalPayableAmount = totalAmount - (Number(discountAmount) || 0);
        newPurchaseInvoice.dueAmount = newPurchaseInvoice.totalPayableAmount - (Number(receivedAmount) || 0);
        newPurchaseInvoice.status = newPurchaseInvoice.dueAmount === 0
            ? "Paid"
            : receivedAmount > 0
                ? "Partially Paid"
                : "Unpaid";

        await newPurchaseInvoice.save();

        res.status(201).json(new ApiResponse(201, { newPurchaseInvoice }, "Purchase invoice created successfully."));
    } catch (error) {
        next(error);
    }
});


const fetchAllPurchaseInvoice = asyncHandler( async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const purchaseInvoices = await PurchaseInvoice.find()
        .populate({ path: "supplier", select: "name address mobileNumber" })
        .populate({ path: "items.item", select: "productName itemCode" })
        .populate({ path: "purchaseBy", select: "name" })
        .skip(skip)
        .limit(limit);
        const total = await PurchaseInvoice.countDocuments();
        if (purchaseInvoices) {
            res.status(200).json(new ApiResponse(200, { purchaseInvoices, total, page, limit }, "Purchase invoices fetched successfully."));
        } else {
            res.status(404).json({ message: 'No purchase invoices found' });
        }
    } catch (error) {
        next(error);
    }
});

const getLast90DaysPurchases = asyncHandler(async (req, res, next) => {
    try {
      const purchaseData = await PurchaseInvoice.getDailyPurchaseData(90);
      res.status(200).json(
        new ApiResponse(200, purchaseData, "90 days purchase data fetched")
      );
    } catch (error) {
      next(error);
    }
  });
  
const getTodayPurchaseSummary = asyncHandler(async (req, res, next) => {
    try {
      const [result] = await PurchaseInvoice.getTodayPurchaseSummary();
      const summary = result ? result : { totalPurchases: 0, invoiceCount: 0 };
      
      res.status(200).json(
        new ApiResponse(200, summary, "Today's purchase summary")
      );
    } catch (error) {
      next(error);
    }
  });

const fetchPurchaseInvoiceByID = asyncHandler( async (req, res, next) => {
    try {
        const purchaseInvoice = await PurchaseInvoice.findById(req.params.id);
        if (purchaseInvoice) {
            res.status(200).json(new ApiResponse(200, { purchaseInvoice }, "Purchase invoice fetched successfully."));
        } else {
            res.status(404).json({ message: 'No purchase invoice found' });
        }
    } catch (error) {
        next(error);
    }
});


const searchPurchaseInvoice = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    
    if (!search) {
        throw new ApiError(400, "Search Query is required.");
      }
    try {
        const purchaseInvoices = await PurchaseInvoice.find({
            $or: [
                { invoiceNumber: { $regex: search, $options: "i" }, }, 
                { supplierName:{ $regex: search, $options: "i" } },
                { mobileNumber:{ $regex: search, $options: "i" } }
            ],
              
            }).skip(skip)
            .limit(limit);
            const total = await PurchaseInvoice.countDocuments();
    
            if (purchaseInvoices) {
                res.status(200).json(new ApiResponse(200, {purchaseInvoices, total, page, limit}, "Invoices Fetched"));
            } else {
                throw new ApiError(400, "No invoice found" );
              }

    } catch (error) {
        next(error);
    }
});


const updatePurchaseInvoice = asyncHandler( async (req, res, next) => {
    try {

        const { id } = req.params;
        const updateData = req.body;
        
        const invoice = await PurchaseInvoice.findById(id);
        if (!invoice) {
            throw new ApiError(404, "Invoice not found.");
        }

        const updatedPurchaseInvoice = await PurchaseInvoice.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        res.status(200).json(new ApiResponse(200, { updatedPurchaseInvoice }, "Purchase invoice updated successfully."));
    } catch (error) {
        next(error);
    }
});


const deletePurchaseInvoice = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedInvoice = await PurchaseInvoice.findByIdAndDelete(id);

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
    fetchLastPurchaseInvoice,
    createPurchaseInvoice,
    fetchAllPurchaseInvoice,
    getLast90DaysPurchases,
    getTodayPurchaseSummary,
    fetchPurchaseInvoiceByID, 
    searchPurchaseInvoice, 
    updatePurchaseInvoice, 
    deletePurchaseInvoice,
};