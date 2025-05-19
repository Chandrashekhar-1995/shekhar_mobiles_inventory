import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Fault } from "../models/fault.model.js";

const createFault = asyncHandler(async (req, res, next) => {
    try {
        const { fault, subFaults } = req.body;

        if (!fault) {
            throw new ApiError(400, "Fault name is required.");
        }

        const existingFault = await Fault.findOne({ fault });
        if (existingFault) {
            throw new ApiError(409, "Fault already exists.");
        }

        const finalSubFaults = Array.isArray(subFaults) && subFaults.length > 0 ? subFaults : [fault];

        const newFault = new Fault({
            fault,
            subFaults: finalSubFaults,
        });

        await newFault.save();

        res.status(201).json(new ApiResponse(201, newFault, "Fault created successfully."));
    } catch (error) {
        next(error);
    }
});


const fetchAllFault = asyncHandler( async (req, res, next) =>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const faults = await Fault.find()
        .skip(skip)
        // .limit(limit);
        const total = await Fault.countDocuments()

        if (faults) {
            res.status(201).json(new ApiResponse(200, { faults, total, page, limit }, "All faults fetched successfully."));
        } else {
            throw new ApiError(404, "No Fault found please create a fault")
        }      

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!search) {
        throw new ApiError(400, "Search Query is required." );
    }
    try {
        const { search } = req.query;
        if (!search) {
                throw new ApiError(400, "Search Query is required." );
              }
        
        const faults = await Fault.find({
            fault: { $regex: search, $options: "i" } 
        })
        .skip(skip)
        // .limit(limit);
        const total = await Fault.countDocuments();

        if (faults) {
            res.status(200).json(new ApiResponse(200, {faults, total, page, limit}, "Fault Fetched"));
        } else {
              throw new ApiError(400, "No fault found" );
          }


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


const addSubFault = asyncHandler(async (req, res, next) => {
    const { fault, subFaults } = req.body;
  try {
      if (!fault || !subFaults) {
        throw new ApiError(400, "Fault and subfault are required.");
      }

      const subFaultsList = Array.isArray(subFaults)
        ? subFaults
        : [subFaults];
    
      const existingFault = await Fault.findById(fault);
    
      if (!existingFault) {
        throw new ApiError(404, "Fault not found.");
      }

      const existingSubFaults = existingFault.subFaults.map((s) =>
        s.toLowerCase()
      );
    
      const newSubFaults = subFaultsList.filter(
        (sub) => !existingSubFaults.includes(sub.toLowerCase())
      );
    
      if (newSubFaults.length === 0) {
        throw new ApiError(400, "No new sub fault to add.");
      }
    
      existingFault.subFaults.push(...newSubFaults);
      await existingFault.save();
    
      return res.status(200).json(
        new ApiResponse(200, existingFault, "Sub Fault added successfully.")
      );
  } catch (error) {
    next(error)
  }
  });


export {
    createFault,
    fetchAllFault,
    fetchFaultByID,
    searchFault,
    updateFault,
    deleteFault,
    addSubFault,
}