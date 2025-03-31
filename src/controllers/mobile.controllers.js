import {Mobile} from "../models/mobile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// Create Mobile
const createMobile = async (req, res, next) => {
    try {
        const {
            MobileType,
            brand,
            brandName,
            modelNo,
            emeiNumber,
            emeiNumberSecond,
            productImage,
            purchasePrice,
            salePrice,
            minSalePrice,
            mrp,
            stockQuantity,
            description,
            warranty,
            printDescription,
            enableTracking,
            printEmeiNo,
          } = req.body;

        if (!brand || !modelNo ) {
            throw new ApiError(400, "Item details are required.");
        }     

        // Check if the mobile with same emei already exists
        const existingMobileEmei = await Mobile.findOne({ emeiNumber });
        if (existingMobileEmei) {
            throw new ApiError(409, "Mobile already exists with same emei.");
        }

        const newMobile = new Mobile({
            MobileType,
            brand, //_id
            brandName,
            modelNo,
            emeiNumber,
            emeiNumberSecond,
            productImage,
            purchasePrice,
            salePrice,
            minSalePrice,
            mrp,
            stockQuantity,  // opening quantity
            description,
            warranty,
            printDescription,
            enableTracking,
            printEmeiNo,
        });

        await newMobile.save();


        res.status(201).json(new ApiResponse(201, newMobile, "Mobile created successfully."));
    } catch (err) {
        next(err);
    }
};



export { createMobile};