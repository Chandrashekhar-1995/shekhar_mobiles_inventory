import { RepairTracking } from '../models/repairTracking.model';
import { Repair } from '../models/repair.model';
import { RepairProcess } from '../models/repairProcess.model';

// Start tracking a repair process
export const startRepairTracking = async (req, res) => {
  try {
    const { repairId, repairItemIndex, processId } = req.body;
    const userId = req.user._id;

    // Validate repair exists
    const repair = await Repair.findById(repairId);
    if (!repair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    // Validate repair item exists
    if (!repair.repairing[repairItemIndex]) {
      return res.status(400).json({ message: 'Invalid repair item index' });
    }

    // Validate process exists
    const process = await RepairProcess.findById(processId);
    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    // Check if tracking already exists
    const existingTracking = await RepairTracking.findOne({
      repair: repairId,
      repairItemIndex
    });

    if (existingTracking) {
      return res.status(400).json({ message: 'Tracking already exists for this repair item' });
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

    res.status(201).json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update repair tracking progress
export const updateRepairTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStep, steps, completedStep } = req.body;
    const userId = req.user._id;

    const tracking = await RepairTracking.findById(id);
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking not found' });
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
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tracking for a repair item
export const getRepairTracking = async (req, res) => {
  try {
    const { repairId, repairItemIndex } = req.params;

    const tracking = await RepairTracking.findOne({
      repair: repairId,
      repairItemIndex
    })
    .populate('process', 'name steps')
    .populate('repair', 'repairNumber');

    if (!tracking) {
      return res.status(404).json({ message: 'Tracking not found' });
    }

    res.json(tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};