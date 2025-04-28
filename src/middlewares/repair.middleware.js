import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";

const processRepairing = async (repairing) => {
    if (!repairing || repairing.length === 0) {
        throw new ApiError(400, "Repair details are required.");
    }

    let totalAmount = 0;
    const repairDetails = [];

    for (const repair of repairing) {
        const { type } = repair;

        if (!type) throw new ApiError(400, "Repair type is missing.");

        let repairTypeAmount = 0;

        if (repair.repairPrice) {
            repairTypeAmount += repair.repairPrice;
        }

        if (repair.usedItems && repair.usedItems.length > 0) {
            for (const item of repair.usedItems) {
                const product = await Product.findById(item.usedItem);
                if (!product) throw new ApiError(404, `Product not found: ${item.usedItem}`);

                product.stockQuantity -= item.quantity;
                product.saleHistory.push({ invoiceId: null });  // repair invoiceId set nahi kiya abhi
                await product.save();

                repairTypeAmount += (item.salePrice || 0) * (item.quantity || 0);
            }
        }

        totalAmount += repairTypeAmount;
        repairDetails.push(repair);
    }

    return { repairDetails, totalAmount };
};


export {
    processRepairing,
};