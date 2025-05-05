import express from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import {  
    createRepairProcess,  
    getRepairProcesses,  
    getProcessByFault,  
    updateRepairProcess
        } from "../controllers/repairProcess.controllers.js";
import { 
    startRepairTracking, 
    updateRepairTracking, 
    getRepairTracking
        } from "../controllers/repairTracking.controllers.js";

const repairProcessRoutes = express.Router();

// Repair Process Routes
repairProcessRoutes.post('/processes', isLoggedIn, isUser, createRepairProcess);
repairProcessRoutes.get('/processes', isLoggedIn, isUser, getRepairProcesses);
repairProcessRoutes.get('/processes/by-fault/:faultId/:deviceType', isLoggedIn, isUser, getProcessByFault);
repairProcessRoutes.put('/processes/:id', isLoggedIn, isUser, updateRepairProcess);

// Repair Tracking Routes
repairProcessRoutes.post('/tracking', isLoggedIn, isUser, startRepairTracking);
repairProcessRoutes.put('/tracking/:id', isLoggedIn, isUser, updateRepairTracking);
repairProcessRoutes.get('/tracking/:repairId/:repairItemIndex', isLoggedIn, isUser, getRepairTracking);

export default repairProcessRoutes;