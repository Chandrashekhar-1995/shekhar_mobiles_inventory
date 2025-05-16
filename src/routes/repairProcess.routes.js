import express from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import {  createRepairProcess, getRepairProcesses, getProcessByFault, updateRepairProcess,  deleteRepairProcess, getRepairProcessByID } from "../controllers/repairProcess.controllers.js";

const repairProcessRoutes = express.Router();

// Repair Process Routes
repairProcessRoutes.post('/create', isLoggedIn, isUser, createRepairProcess);
repairProcessRoutes.get('/all', isLoggedIn, isUser, getRepairProcesses);
repairProcessRoutes.get('/:id', isLoggedIn, isUser, getRepairProcessByID);
repairProcessRoutes.get('/by-fault/:faultId/:deviceType', isLoggedIn, isUser, getProcessByFault);
repairProcessRoutes.put('/:id', isLoggedIn, isUser, updateRepairProcess);
repairProcessRoutes.delete('/:id', isLoggedIn, isUser, deleteRepairProcess);

export default repairProcessRoutes;