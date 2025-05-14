import express from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import {  
    createRepairProcess,  
    getRepairProcesses,  
    getProcessByFault,  
    updateRepairProcess,
    deleteRepairProcess
        } from "../controllers/repairProcess.controllers.js";
import { 
    startRepairTracking, 
    updateRepairTracking, 
    getRepairTracking
        } from "../controllers/repairTracking.controllers.js";

const repairProcessRoutes = express.Router();

// Repair Process Routes
repairProcessRoutes.post('/create', isLoggedIn, isUser, createRepairProcess);
repairProcessRoutes.get('/all', isLoggedIn, isUser, getRepairProcesses);
repairProcessRoutes.get('/by-fault/:faultId/:deviceType', isLoggedIn, isUser, getProcessByFault);
repairProcessRoutes.put('/:id', isLoggedIn, isUser, updateRepairProcess);
repairProcessRoutes.delete('/:id', isLoggedIn, isUser, deleteRepairProcess);

// Repair Tracking Routes
repairProcessRoutes.post('/tracking', isLoggedIn, isUser, startRepairTracking);
repairProcessRoutes.put('/tracking/:id', isLoggedIn, isUser, updateRepairTracking);
repairProcessRoutes.get('/tracking/:repairId/:repairItemIndex', isLoggedIn, isUser, getRepairTracking);

export default repairProcessRoutes;