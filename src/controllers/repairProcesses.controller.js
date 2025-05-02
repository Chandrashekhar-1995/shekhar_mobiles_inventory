import { RepairProcess } from "../models/repairProcess.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create a new repair process
const createRepairProcess = asyncHandler(async (req, res, next) => {
  try {
    const { faultType, faultSubType, deviceType, processName, processSteps } = req.body;

    if (!processSteps || processSteps.length === 0) {
      throw new ApiError(400, "At least one process step is required.");
    }

    const newProcess = await RepairProcess.create({
      faultType,
      faultSubType,
      deviceType,
      processName,
      processSteps,
      createdBy: req.user._id
    });

    res.status(201).json(
      new ApiResponse(201, newProcess, "Repair process created successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Get all repair processes
const getAllRepairProcesses = asyncHandler(async (req, res, next) => {
  try {
    const { faultType, deviceType } = req.query;
    const filter = {};
    
    if (faultType) filter.faultType = faultType;
    if (deviceType) filter.deviceType = deviceType;
    
    const processes = await RepairProcess.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json(
      new ApiResponse(200, { processes }, "Processes fetched successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Get repair process by ID
const getRepairProcessById = asyncHandler(async (req, res, next) => {
  try {
    const process = await RepairProcess.findById(req.params.id)
      .populate("createdBy", "username");

    if (!process) {
      throw new ApiError(404, "Repair process not found.");
    }

    res.status(200).json(
      new ApiResponse(200, process, "Process fetched successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Update repair process
const updateRepairProcess = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const process = await RepairProcess.findById(id);
    if (!process) {
      throw new ApiError(404, "Repair process not found.");
    }

    const updatedProcess = await RepairProcess.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(
      new ApiResponse(200, updatedProcess, "Process updated successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Toggle process active status
const toggleProcessStatus = asyncHandler(async (req, res, next) => {
  try {
    const process = await RepairProcess.findById(req.params.id);
    if (!process) {
      throw new ApiError(404, "Repair process not found.");
    }

    process.isActive = !process.isActive;
    await process.save();

    res.status(200).json(
      new ApiResponse(200, process, "Process status updated successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Get processes by fault
const getProcessesByFault = asyncHandler(async (req, res, next) => {
  try {
    const { faultType, deviceType = "mobile" } = req.params;

    const processes = await RepairProcess.find({
      faultType,
      deviceType,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, { processes }, "Processes fetched successfully.")
    );
  } catch (error) {
    next(error);
  }
});

// Get processes by fault type
const getProcessesByFaultType = asyncHandler(async (req, res, next) => {
  try {
    const { faultType } = req.params;
    const { deviceType = "mobile" } = req.query;

    // Validate problem type
    const validProblemTypes = [
      "charging", 
      "display", 
      "touch", 
      "battery", 
      "software", 
      "camera",
      "speaker",
      "microphone",
      "water_damage",
      "other"
    ];

    if (!validProblemTypes.includes(problemType)) {
      throw new ApiError(400, "Invalid problem type");
    }

    // Find active processes matching the problem type and device type
    const processes = await RepairProcess.find({
      problemType,
      deviceType,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!processes || processes.length === 0) {
      throw new ApiError(404, "No processes found for this problem type")
    }

    res.status(200).json(
      new ApiResponse(200, { processes }, "Processes fetched successfully")
    );
  } catch (error) {
    next(error);
  }
});



export {
  createRepairProcess,
  getAllRepairProcesses,
  getRepairProcessById,
  updateRepairProcess,
  toggleProcessStatus,
  getProcessesByFault,
  getProcessesByFaultType,
};