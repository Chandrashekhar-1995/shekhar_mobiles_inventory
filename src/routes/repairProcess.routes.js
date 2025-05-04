import express from 'express';
import {
  createRepairProcess,
  getRepairProcesses,
  getProcessByFault,
  updateRepairProcess
} from '../controllers/repairProcess.controller';
import {
  startRepairTracking,
  updateRepairTracking,
  getRepairTracking
} from '../controllers/repairTracking.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Repair Process Routes
router.post('/processes', auth, createRepairProcess);
router.get('/processes', auth, getRepairProcesses);
router.get('/processes/by-fault/:faultId/:deviceType', auth, getProcessByFault);
router.put('/processes/:id', auth, updateRepairProcess);

// Repair Tracking Routes
router.post('/tracking', auth, startRepairTracking);
router.put('/tracking/:id', auth, updateRepairTracking);
router.get('/tracking/:repairId/:repairItemIndex', auth, getRepairTracking);

export default router;