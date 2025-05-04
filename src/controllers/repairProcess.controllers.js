import { RepairProcess } from '../models/repairProcess.model';
import { Fault } from '../models/fault.model';

// Create a new standard repair process
export const createRepairProcess = async (req, res) => {
  try {
    const { name, fault, deviceType, steps } = req.body;
    const createdBy = req.user._id;

    // Validate fault exists
    const faultExists = await Fault.findById(fault);
    if (!faultExists) {
      return res.status(400).json({ message: 'Fault not found' });
    }

    const process = new RepairProcess({
      name,
      fault,
      deviceType,
      steps,
      createdBy
    });

    await process.save();
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all repair processes
export const getRepairProcesses = async (req, res) => {
  try {
    const processes = await RepairProcess.find({ isActive: true })
      .populate('fault', 'name')
      .populate('createdBy', 'name');
    res.json(processes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get repair process by fault
export const getProcessByFault = async (req, res) => {
  try {
    const { faultId, deviceType } = req.params;
    
    const process = await RepairProcess.findOne({
      fault: faultId,
      deviceType,
      isActive: true
    });
    
    if (!process) {
      return res.status(404).json({ message: 'No standard process found for this fault' });
    }
    
    res.json(process);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a repair process
export const updateRepairProcess = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user._id;

    const process = await RepairProcess.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy },
      { new: true }
    );

    if (!process) {
      return res.status(404).json({ message: 'Process not found' });
    }

    res.json(process);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};