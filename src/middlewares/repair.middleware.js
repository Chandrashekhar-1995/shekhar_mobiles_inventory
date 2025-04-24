import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

const processRepairing = async (repairing, invoiceId) => {
    if (!repairing || repairing.length === 0) {
        throw new ApiError(400, "Repair details are required.");
    }

    let totalAmount = 0;
    const repairDetails = [];

    for (const repair of repairing) {
        const { type } = repair;

        if (!type) throw new ApiError(400, "Repair type is required.");

        if (type === "mobile") {
            if (!repair.mobiles || repair.mobiles.length === 0) {
                throw new ApiError(400, "Mobiles data is required for mobile repair.");
            }

            repair.repairItem = "";

            // calculate amount from fault and usedItems
            let repairTypeAmount = 0;

            for (const mobile of repair.mobiles) {
                if (repair.fault && repair.fault.length > 0) {
                    for (const f of repair.fault) {
                        repairTypeAmount += f.repairPrice || 0;
                    }
                }

                if (repair.usedItems && repair.usedItems.length > 0) {
                    for (const item of repair.usedItems) {
                        if (!item.item || !item.quantity || !item.salePrice) {
                            throw new ApiError(400, "Incomplete used item data.");
                        }

                        const product = await Product.findById(item.item);
                        if (!product) throw new ApiError(404, `Product not found: ${item.item}`);

                        const itemTotal = item.quantity * item.salePrice;
                        repairTypeAmount += itemTotal;

                        // Stock adjustments
                        product.stockQuantity -= item.quantity;
                        product.saleHistory = product.saleHistory || [];
                        product.saleHistory.push(invoiceId);
                        await product.save();
                    }
                }
            }

            totalAmount += repairTypeAmount;
            repairDetails.push(repair);
        } else {
            if (!repair.repairItem) {
                throw new ApiError(400, "Repair item description is required for non-mobile repairs.");
            }

            repair.mobiles = [];

            let repairTypeAmount = 0;

            if (repair.fault && repair.fault.length > 0) {
                for (const f of repair.fault) {
                    repairTypeAmount += f.repairPrice || 0;
                }
            }

            if (repair.usedItems && repair.usedItems.length > 0) {
                for (const item of repair.usedItems) {
                    if (!item.item || !item.quantity || !item.salePrice) {
                        throw new ApiError(400, "Incomplete used item data.");
                    }

                    const product = await Product.findById(item.item);
                    if (!product) throw new ApiError(404, `Product not found: ${item.item}`);

                    const itemTotal = item.quantity * item.salePrice;
                    repairTypeAmount += itemTotal;

                    // Stock adjustments
                    product.stockQuantity -= item.quantity;
                    product.saleHistory = product.saleHistory || [];
                    product.saleHistory.push(invoiceId);
                    await product.save();
                }
            }

            totalAmount += repairTypeAmount;
            repairDetails.push(repair);
        }
    }

    return { repairDetails, totalAmount };
};


export {
    processRepairing,
};