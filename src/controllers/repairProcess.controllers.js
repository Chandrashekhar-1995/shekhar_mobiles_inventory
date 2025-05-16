import { RepairProcess } from "../models/repairProcess.model.js";
import { Fault } from "../models/fault.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new standard repair process
const createRepairProcess = asyncHandler(async (req, res, next) => {
  try {
    const { processName, fault, subFaults, deviceType, steps } = req.body;

    const faultExists = await Fault.findById(fault);
    if (!faultExists) {
      throw new ApiError(400, "Fault not found");
    }

    const process = new RepairProcess({
      processName,
      fault,
      subFaults,
      deviceType,
      steps,
      createdBy : req.user._id
    });

    await process.save();

    res.status(201).json(new ApiResponse(201, process, "Process created sucessfully."));

  } catch (error) {
   next(error);
  }
});

// Get all repair processes
const getRepairProcesses = asyncHandler( async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const processes = await RepairProcess.find({ isActive: true })
      .populate("fault", "fault")
      .populate( "createdBy", "name")
      .skip(skip)
      // .limit(limit)
      const total = await RepairProcess.countDocuments();

      if(processes){
        res.status(200).json(
          new ApiResponse(200, { processes, total, page, limit }, "Repair process fetched successfully."))
      } else {
        throw new ApiError(404, "No repair process found.");
    }
  } catch (error) {
    next(error);
  }
});

// Get repair Process by id
const getRepairProcessByID = asyncHandler (async (req, res, next) =>{
    try {
        const process = await RepairProcess.findById(req.params.id);
        if (!process) {
            throw new ApiError(404, "Repair process not found");
        }

    res.json(new ApiResponse(200, process, "Repair process found"));

    } catch (error) {
         next(error);
    }
});

// Get repair process by fault
const getProcessByFault = asyncHandler( async (req, res, next) => {
  try {
    const { faultId, deviceType } = req.params;
    
    const process = await RepairProcess.findOne({
      fault: faultId,
      deviceType,
      isActive: true
    });
    
    if (!process) {
      throw new ApiError(404, "Repair process not found for this fault and device type.");
    }
    
    res.status(200).json(
      new ApiResponse(200, process, "Repair process fetched successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Update a repair process
const updateRepairProcess = asyncHandler( async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user._id;
    const process = await RepairProcess.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy },
      { new: true }
    );

    if (!process) {
      throw new ApiError(404, "Repair process not found.");
    }

    res.status(200).json(
      new ApiResponse(200, process, "Repair process updated successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Delete a repair process
const deleteRepairProcess = asyncHandler( async (req, res, next) => {
  try {
    const { id } = req.params;
    const process = await RepairProcess.findByIdAndDelete(id);

    if (!process) {
      throw new ApiError(404, "Repair process not found.");
    }

    res.status(200).json(
      new ApiResponse(200, {}, "Repair process deleted.")
    );
  } catch (error) {
    next(error);
  }
});



export {
  createRepairProcess,
  getRepairProcesses,
  getRepairProcessByID,
  getProcessByFault,
  updateRepairProcess,
  deleteRepairProcess,
}