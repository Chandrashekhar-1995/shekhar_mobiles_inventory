import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

const processItems = async (items, invoiceId) => {

    if (!items || items.length === 0) {
        throw new ApiError(400, "At least one item is required to create an invoice.");
    }

    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
        if (!item.item || !item.quantity || !item.purchasePrice) {
            throw new ApiError(400, "Item name, quantity, and sale price are required for each item.");
        }

        // Fetch the product from the database
        const product = await Product.findById(item.item);
        if (!product) {
            throw new ApiError(404, `Item with ID ${item.item} not found.`);
        }

        const quantity = Number(item.quantity);
        const purchasePrice = Number(item.purchasePrice);
        const discount = Number(item.discount || 0);

        // Calculate total for each item
        const itemTotal = quantity * purchasePrice;
        const discountAmount = discount ? (itemTotal * discount) / 100 : 0;
        const netTotal = itemTotal - discountAmount;

        totalAmount += netTotal;

        itemDetails.push({
            item: item.item,
            quantity: quantity,
            purchasePrice: purchasePrice,
            discount: discount,
            total: netTotal,
            itemDescription: item.itemDescription,
        });

        // Reduce the stock quantity
        product.stockQuantity += quantity;

        // Update sale history for the product
        product.saleHistory.push(invoiceId);
        await product.save();
    }

    return { itemDetails, totalAmount };
};


export {
    processItems,
};