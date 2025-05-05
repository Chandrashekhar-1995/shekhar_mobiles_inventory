import { RepairTracking } from "../models/repairTracking.model.js";
import { Repair } from "../models/repair.model.js";
import { RepairProcess } from "../models/repairProcess.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Start tracking a repair process
const startRepairTracking = asyncHandler( async (req, res, next) => {
  try {
    const { repairId, repairItemIndex, processId } = req.body;
    const userId = req.user._id;

    // Validate repair exists
    const repair = await Repair.findById(repairId);
    if (!repair) {
      throw new ApiError(404, 'Repair not found');
    }

    // Validate repair item exists
    if (!repair.repairing[repairItemIndex]) {
     throw new ApiError(404, 'Repair item not found'); 
    }

    // Validate process exists
    const process = await RepairProcess.findById(processId);
    if (!process) {
      throw new ApiError(404, 'Repair process not found');
    }

    // Check if tracking already exists
    const existingTracking = await RepairTracking.findOne({
      repair: repairId,
      repairItemIndex
    });

    if (existingTracking) {
      throw new ApiError(400, 'Repair tracking already exists for this item');
    }

    // Create steps for tracking
    const steps = process.steps.map(step => ({
      step: step._id,
      isCompleted: false,
      checklist: step.checklistItems.map(item => ({
        itemName: item.itemName,
        isChecked: false
      }))
    }));

    const tracking = new RepairTracking({
      repair: repairId,
      repairItemIndex,
      process: processId,
      steps,
      status: 'in_progress',
      startedAt: new Date()
    });

    await tracking.save();

    // Update repair status to in_progress
    repair.repairing[repairItemIndex].repairStatus = 'in_progress';
    await repair.save();

    res.status(201).json(
      new ApiResponse(201, tracking, 'Repair tracking started successfully')
    )
  } catch (error) {
    next(error);
  }
});

// Update repair tracking progress
 const updateRepairTracking = asyncHandler( async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentStep, steps, completedStep } = req.body;
    const userId = req.user._id;

    const tracking = await RepairTracking.findById(id);
    if (!tracking) {
      throw new ApiError(404, 'Repair tracking not found');
    }

    // Update current step
    if (currentStep !== undefined) {
      tracking.currentStep = currentStep;
    }

    // Update specific step completion
    if (completedStep !== undefined && steps[completedStep]) {
      tracking.steps[completedStep].isCompleted = true;
      tracking.steps[completedStep].completedAt = new Date();
      tracking.steps[completedStep].completedBy = userId;
      
      // Update checklist items with user who checked them
      tracking.steps[completedStep].checklist = steps[completedStep].checklist.map(item => ({
        ...item,
        checkedBy: item.isChecked ? userId : null,
        checkedAt: item.isChecked ? new Date() : null
      }));
    }

    // Check if all steps are completed
    const allStepsCompleted = tracking.steps.every(step => step.isCompleted);
    if (allStepsCompleted) {
      tracking.status = 'completed';
      tracking.completedAt = new Date();
      
      // Update repair status to repair_done
      const repair = await Repair.findById(tracking.repair);
      if (repair) {
        repair.repairing[tracking.repairItemIndex].repairStatus = 'repair_done';
        await repair.save();
      }
    }

    await tracking.save();

    res.status(200).json(
      new ApiResponse(200, tracking, 'Repair tracking updated successfully')
    );
  } catch (error) {
    next(error);
  }
});

// Get tracking for a repair item
const getRepairTracking = asyncHandler( async (req, res, next) => {
  try {
    const { repairId, repairItemIndex } = req.params;

    const tracking = await RepairTracking.findOne({
      repair: repairId,
      repairItemIndex
    })
    .populate('process', 'name steps')
    .populate('repair', 'repairNumber');

    if (!tracking) {
      throw new ApiError(404, 'Repair tracking not found');
    }

    res.status(200).json(
      new ApiResponse(200, tracking, 'Repair tracking fetched successfully')
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export {
  startRepairTracking,
  updateRepairTracking,
  getRepairTracking 
}