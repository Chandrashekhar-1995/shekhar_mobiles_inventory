const PurchaseInvoice = require("../models/purchaseInvoice.model");
const Customer = require("../models/customer.model");
const Product = require("../models/Product.model");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const generatePurchaseInvoiceNumber = async () => {
    const lastInvoice = await PurchaseInvoice.findOne().sort({ createdAt: -1 });
    const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split("-")[1]) : 0;
    return `PINV-${(lastNumber + 1).toString().padStart(4, "0")}`;
};

const createPurchaseInvoice = async (req, res, next) => {
    try {
        const {
            invoiceType,
            invoiceNumber,
            date,
            dueDate,
            placeOfSupply,
            billFrom,
            supplierId,
            supplierName,
            mobileNumber,
            address,
            items,
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

        const finalSupplierId = billFrom === "Cash" ? "6790a5b3d50038409a777e3d" : supplierId;
        const supplier = await Customer.findById(finalSupplierId);
        if (!supplier) {
            throw new ApiError(404, "Supplier not found.");
        }
        //here write logic for check Customer.desiganation==="Supplier"

        const newPurchaseInvoice = new PurchaseInvoice({
            invoiceType,
            invoiceNumber: invoiceNumber ? invoiceNumber : await generatePurchaseInvoiceNumber(),
            date,
            dueDate,
            placeOfSupply,
            billFrom,
            supplier: finalSupplierId,
            supplierName,
            mobileNumber,
            address,
            discountAmount,
            paymentDate,
            paymentMode,
            receivedAmount,
            transactionId,
            privateNote,
            supplierNote,
            soldBy: soldBy ? soldBy : req.user._id,
            deliveryTerm,
            srNumber
        });

        let totalAmount = 0;
        const itemDetails = [];
        for (const item of items) {
            const product = await Product.findById(item.item);
            if (!product) {
                throw new ApiError(404, `Item with ID ${item.item} not found.`);
            }

            const itemTotal = item.quantity * item.purchasePrice;
            const discountAmount = item.discount ? (itemTotal * item.discount) / 100 : 0;
            const netTotal = itemTotal - discountAmount;
            totalAmount += netTotal;

            itemDetails.push({
                item: item.item,
                productName: item.productName,
                itemCode: item.itemCode,
                unit: item.unit,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                mrp: item.mrp,
                discount: item.discount || 0,
                total: netTotal,
                itemDescription: item.itemDescription,
            });

            product.stockQuantity += item.quantity;
            await product.save();
        }

        newPurchaseInvoice.items = itemDetails;
        newPurchaseInvoice.totalAmount = totalAmount;
        newPurchaseInvoice.totalPayableAmount = totalAmount - discountAmount;
        newPurchaseInvoice.receivedAmount = receivedAmount;
        newPurchaseInvoice.dueAmount = newPurchaseInvoice.totalPayableAmount - receivedAmount;
        newPurchaseInvoice.status = newPurchaseInvoice.dueAmount === 0
            ? "Paid"
            : receivedAmount > 0
                ? "Partially Paid"
                : "Unpaid";

        await newPurchaseInvoice.save();

        res.status(201).json(new ApiResponse(201, { newPurchaseInvoice }, "Purchase invoice created successfully."));
    } catch (err) {
        next(err);
    }
};

const lastPurchaseInvoiceFetch = async (req, res, next) => {
    try {
        const lastPurchaseInvoice = await PurchaseInvoice.findOne().sort({ createdAt: -1 });
        if (lastPurchaseInvoice) {
            res.status(200).json(new ApiResponse(200, { lastPurchaseInvoice }, "Last purchase invoice fetched successfully."));
        } else {
            res.status(404).json({ message: 'No purchase invoices found' });
        }
    } catch (err) {
        next(err);
    }
};

const allPurchaseInvoiceFetch = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const purchaseInvoices = await PurchaseInvoice.find().skip(skip).limit(limit);
        const total = await PurchaseInvoice.countDocuments();
        if (purchaseInvoices) {
            res.status(200).json(new ApiResponse(200, { purchaseInvoices, total, page, limit }, "Purchase invoices fetched successfully."));
        } else {
            res.status(404).json({ message: 'No purchase invoices found' });
        }
    } catch (err) {
        next(err);
    }
};

const purchaseInvoiceFetchById = async (req, res, next) => {
    try {
        const purchaseInvoice = await PurchaseInvoice.findById(req.params.id);
        if (purchaseInvoice) {
            res.status(200).json(new ApiResponse(200, { purchaseInvoice }, "Purchase invoice fetched successfully."));
        } else {
            res.status(404).json({ message: 'No purchase invoice found' });
        }
    } catch (err) {
        next(err);
    }
};

const updatePurchaseInvoice = async (req, res, next) => {
    try {
        const updatedPurchaseInvoice = await PurchaseInvoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(new ApiResponse(200, { updatedPurchaseInvoice }, "Purchase invoice updated successfully."));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPurchaseInvoice,
    lastPurchaseInvoiceFetch,
    allPurchaseInvoiceFetch,
    purchaseInvoiceFetchById,
    updatePurchaseInvoice
};