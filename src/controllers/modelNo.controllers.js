import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { ModelNo } from "../models/modelNo.model.js";

const createModelNo = asyncHandler( async(req, res,next)=>{

    try {
        const { modelNo } = req.body;

        const existingModel = await ModelNo.findOne({ modelNo });
        if (existingModel) {
            throw new ApiError(409, "Model No already exists.");
        }

        // Create the brand
        const model = await ModelNo.create({ modelNo });

        res.status(201).json(new ApiResponse(201, model, "Model created successfully."));
 
    } catch (error) {
        next(error);
    };
});


const fetchAllModelNo = asyncHandler( async (req, res, next) =>{
    try {
        const allModels = await ModelNo.find();
        res.status(201).json(new ApiResponse(200, allModels, "All model fetched successfully."));

    } catch (error) {
        next(error);
    }
});


const fetchModelNoByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const model = await ModelNo.findById(id);
        res.status(200).json(new ApiResponse(200, model, "Model Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchModelNo = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        const models = await ModelNo.find({
            modelNo: { $regex: search, $options: "i" } 
        }).limit(20);

        if (models.length , 0) {
            throw new ApiError(404, "No model no found" );
          }

        res.status(200).json(new ApiResponse(200, models, "Brand Fetched"));

    } catch (error) {
        next(error);
    }
});


const updateModelNo = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const model = await ModelNo.findById(id);
          if (!model) {
              throw new ApiError(404, "Model not found, please select a correct model");
          }
        
        const updatedModel = await ModelNo.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedModel) {
              throw new ApiError(500, "Failed to update brand");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedModel, "Model updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteModel = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedModel = await ModelNo.findByIdAndDelete(id);

        if (!deletedModel) {
                throw new ApiError(404, "Model not found, please select a correct model");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Model deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});


export {
    createModelNo,
    fetchAllModelNo,
    fetchModelNoByID,
    searchModelNo,
    updateModelNo,
    deleteModel
}