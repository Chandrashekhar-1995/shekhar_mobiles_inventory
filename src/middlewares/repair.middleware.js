import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

const processRepairing = async (repairing, invoiceId) => {
    if (!repairing || repairing.length === 0) {
        throw new ApiError(400, "Repair details are required.");
    }

    let totalAmount = 0;
    const repairDetails = [];

    for (const repair of repairing) {
        if (repair.type === "mobile") {
            for (const mobileRepair of repair.mobile) {
                // Process used items if any
                if (mobileRepair.usedItems && mobileRepair.usedItems.length > 0) {
                    for (const item of mobileRepair.usedItems) {
                        if (!item.productName || !item.quantity || !item.salePrice) {
                            throw new ApiError(400, "Item name, quantity, and sale price are required for each used item.");
                        }

                        const product = await Product.findById(item.item);
                        if (!product) {
                            throw new ApiError(404, `Item with ID ${item.item} not found.`);
                        }

                        // Calculate item total
                        const itemTotal = item.quantity * item.salePrice;
                        totalAmount += itemTotal;

                        // Reduce stock quantity
                        product.stockQuantity -= item.quantity;
                        product.saleHistory.push(invoiceId);
                        await product.save();
                    }
                }
            }
        }
    }

    return { repairDetails, totalAmount };
};

const validateRepairRequest = (req, res, next) => {
    const { billTo, repairing, paymentMode, advanceAmount } = req.body;

    if (!billTo || !repairing || !paymentMode || advanceAmount === undefined) {
        throw new ApiError(400, "Missing required fields: billTo, repairing, paymentMode, or advanceAmount.");
    }

    if (!Array.isArray(repairing) || repairing.length === 0) {
        throw new ApiError(400, "Repairing details must be a non-empty array.");
    }

    next();
};

export {
    processRepairing,
    validateRepairRequest,
};