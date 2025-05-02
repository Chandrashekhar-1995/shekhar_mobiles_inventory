import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Fault } from "../models/fault.model.js";

const createFault = asyncHandler( async(req, res,next)=>{

    try {
        const { fault } = req.body;

        const existingFault = await Fault.findOne({ fault });
        if (existingFault) {
            throw new ApiError(409, "Fault already exists.");
        }

        const newFault = await Fault.create({ fault });

        res.status(201).json(new ApiResponse(201, newFault, "Fault created successfully."));
 
    } catch (error) {
        next(error);
    };
});


const fetchAllFault = asyncHandler( async (req, res, next) =>{
    try {
        const allFaults = await Fault.find();
        if (allFaults && allFaults.length > 0) {
            res.status(201).json(new ApiResponse(200, allFaults, "All faults fetched successfully."));
        } else {
            throw new ApiError(404, "No Fault found please create a fault")
        }

        res.status(201).json(new ApiResponse(200, allFaults, "All faults fetched successfully."));        

    } catch (error) {
        next(error);
    }
});


const fetchFaultByID = asyncHandler( async (req, res, next) =>{
    const {id} = req.params;
    try {
        const fault = await Fault.findById(id);
        res.status(200).json(new ApiResponse(200, fault, "Fauly Fetched"));
    } catch (error) {
        next(error);
    }
});


const searchFault = asyncHandler( async (req, res, next) =>{
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        const faults = await Fault.find({
            fault: { $regex: search, $options: "i" } 
        }).limit(20);

        if (faults.length , 0) {
            throw new ApiError(400, "No fault found" );
          }

        res.status(200).json(new ApiResponse(200, faults, "Fault Fetched"));

    } catch (error) {
        next(error);
    }
});


const updateFault = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find the account to update
        const fault = await Fault.findById(id);
          if (!fault) {
              throw new ApiError(404, "Fault not found, please select a correct fault");
          }
        
        const updatedFault = await Fault.findByIdAndUpdate(
              id,
              { $set: updateData },
              { new: true, runValidators: true }
          )
        
        if (!updatedFault) {
              throw new ApiError(500, "Failed to update fault");
          }
        
        res.status(200).json(
              new ApiResponse(200, updatedFault, "Account updated successfully")
          );
        
    } catch (error) {
        next(error);
    }
});


const deleteFault = asyncHandler( async (req, res, next) =>{
    try {
        const { id } = req.params;

        const deletedFault = await Fault.findByIdAndDelete(id);

        if (!deletedFault) {
                throw new ApiError(404, "Fault not found, please select a correct fault");
            }
        
        res.status(200).json(
            new ApiResponse(200, null, "Fault deleted successfully")
          );
    } catch (error) {
        next(error);
    }
});


export {
    createFault,
    fetchAllFault,
    fetchFaultByID,
    searchFault,
    updateFault,
    deleteFault
}