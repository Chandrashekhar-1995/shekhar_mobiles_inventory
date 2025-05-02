import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { createRepairProcess, getAllRepairProcesses, getProcessesByFault, getRepairProcessById, updateRepairProcess, getProcessesByFaultType } from "../controllers/repairProcesses.controller.js";

const repairProcessesRouter = Router();

repairProcessesRouter.post("/create", isLoggedIn, isUser, createRepairProcess);
repairProcessesRouter.get("/all", isLoggedIn, isUser, getAllRepairProcesses);
repairProcessesRouter.get("fault-types", isLoggedIn, isUser, getProcessesByFaultType);
repairProcessesRouter.get("by-fault/:faultType", isLoggedIn, isUser, getProcessesByFault);
repairProcessesRouter.get("/:id", isLoggedIn, isUser, getRepairProcessById );
repairProcessesRouter.put("/:id", isLoggedIn, isUser, updateRepairProcess );


export default repairProcessesRouter; 