import { Brand } from "../models/brand.model.js";
import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createBrand = asyncHandler( async(req, res,next)=>{

    try {
        const { brandName } = req.body;

        const existingBrand = await Brand.findOne({ brandName });
        if (existingBrand) {
            throw new ApiError(409, "Brand already exists.");
        }

        // Create the brand
        const brand = await Brand.create({ brandName });

        res.status(201).json(new ApiResponse(201, brand, "Brand created successfully."));
 
    } catch (error) {
        next(error);
    };
});

const fetchAllBrand = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const brands = await Brand.find()
        .skip(skip)
        .limit(limit);
        const total = await Invoice.countDocuments();

        if(brands){
            res.status(201).json(new ApiResponse(200, { brands, total, page, limit }, "All brand fetched successfully."));
        }else{
            throw new ApiError(404, "No Brand found")
        }

    } catch (error) {
        next(error);
    }
});


const fetchBrandByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const brand = await Brand.findById(id);
        res.status(200).json(new ApiResponse(200, brand, "Brand Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchBrand = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!search) {
        throw new ApiError(400, "Search Query is required." );
    }
    try {
        const brands = await Brand.find({
            brandName: { $regex: search, $options: "i" } 
        })
        .skip(skip)
        .limit(limit);
        const total = await Brand.countDocuments();

        if (brands) {
            res.status(200).json(new ApiResponse(200, {brands, total, page, limit}, "Brand Fetched"));
        } else {
              throw new ApiError(400, "No brand found" );
          }


    } catch (error) {
        next(error);
    }
});


const updateBrand = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const brand = await Brand.findById(id);
          if (!brand) {
              throw new ApiError(404, "Brand not found, please select a correct brand");
          }
        
        const updatedBrand = await Brand.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedBrand) {
              throw new ApiError(500, "Failed to update brand");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedBrand, "Account updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteBrand = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedBrand = await Brand.findByIdAndDelete(id);

        if (!deletedBrand) {
                throw new ApiError(404, "Brand not found, please select a correct account");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Brand deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});


export {
    createBrand,
    fetchAllBrand,
    fetchBrandByID,
    searchBrand,
    updateBrand,
    deleteBrand
}