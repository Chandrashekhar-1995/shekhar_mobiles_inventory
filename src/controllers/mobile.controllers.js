import {Mobile} from "../models/mobile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


// Create Mobile
const createMobile = asyncHandler( async (req, res, next) => {
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
});



const fetchAllMobile = asyncHandler( async (req, res, next) =>{
    try {
        const allMobiles = await Mobile.find();
        res.status(201).json(new ApiResponse(200, allMobiles, "All mobile fetched successfully."));

    } catch (error) {
        next(error);
    }
});


const fetchMobileByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const mobile = await Mobile.findById(id);
        res.status(200).json(new ApiResponse(200, mobile, "Mobile Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchMobile = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        // Case-insensitive search for matching names
        const mobiles = await Mobile.find({
            $or: [
                { MobileType: { $regex: search, $options: "i" }, }, 
                { brandName:{ $regex: search, $options: "i" } },
                { modelNo:{ $regex: search, $options: "i" } }, 
                { emeiNumber:{ $regex: search, $options: "i" } }, 
                { emeiNumberSecond:{ $regex: search, $options: "i" } }
            ],
              
            }).limit(20);

        if (mobiles.length < 0) {
            throw new ApiError(400, "No mobile found" );
          }

        res.status(200).json(new ApiResponse(200, mobiles, "Mobiles Fetched"));

    } catch (error) {
        next(error);
    }
});


const updateMobile = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const mobile = await Mobile.findById(id);
          if (!mobile) {
              throw new ApiError(404, "Mobile not found, please select a correct mobile");
          }
        
        const updateMobile = await Mobile.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updateMobile) {
              throw new ApiError(500, "Failed to update mobile");
          }
        
        res.status(200).json(
              new ApiResponse(200, updateMobile, "Mobile updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteMobile = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedMobile = await Mobile.findByIdAndDelete(id);

        if (!deletedMobile) {
                throw new ApiError(404, "Mobile not found, please select a correct mobile");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Mobile deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});


export { 
    createMobile,
    fetchAllMobile,
    fetchMobileByID,
    searchMobile,
    updateMobile,
    deleteMobile
};