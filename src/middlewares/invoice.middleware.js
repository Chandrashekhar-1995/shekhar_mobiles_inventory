const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");

const processItems = async (items, invoiceId) => {
    if (!items || items.length === 0) {
        throw new ApiError(400, "At least one item is required to create an invoice.");
    }

    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
        if (!item.productName || !item.quantity || !item.salePrice) {
            throw new ApiError(400, "Item name, quantity, and sale price are required for each item.");
        }

        // Fetch the product from the database
        const product = await Product.findById(item.item);
        if (!product) {
            throw new ApiError(404, `Item with ID ${item.item} not found.`);
        }

        // Check stock quantity
        // if (product.stockQuantity < item.quantity) {
        //     throw new ApiError(400, `Insufficient stock for ${item.productName}. Available: ${product.stockQuantity}`);
        // }

        // Calculate total for each item
        const itemTotal = item.quantity * item.salePrice;
        const discountAmount = item.discount ? (itemTotal * item.discount) / 100 : 0;
        const netTotal = itemTotal - discountAmount;
        totalAmount += netTotal;

        itemDetails.push({
            item: item.item,
            productName: item.productName,
            itemCode: item.itemCode,
            unit: item.unit,
            quantity: item.quantity,
            salePrice: item.salePrice,
            mrp: item.mrp,
            discount: item.discount || 0,
            total: netTotal,
            itemDescription: item.itemDescription,
        });

        // Reduce the stock quantity
        product.stockQuantity -= item.quantity;

        // Update sale history for the product
        product.saleHistory.push(invoiceId);
        await product.save();
    }

    return { itemDetails, totalAmount };
};

  const validateInvoiceRequest = (req, res, next) => {
    const { billTo, items, paymentMode, receivedAmount } = req.body;

    if (!billTo || !items || !paymentMode || receivedAmount === undefined) {
        throw new ApiError(400, "Missing required fields: billTo, items, paymentMode, or receivedAmount.");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items must be a non-empty array.");
    }

    next();
};

module.exports = {
  processItems,
  validateInvoiceRequest,
};

  