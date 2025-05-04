import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { createRepair, deleteRepair, fetchAllRepair, fetchLastRepair, fetchRepairByID, searchRepair, updateRepair, updateRepairItem } from "../controllers/repair.controllers.js";

const repairRouter = Router();

repairRouter.get("/last-repair", isLoggedIn, isUser, fetchLastRepair);
repairRouter.post("/create", isLoggedIn, isUser, createRepair);
repairRouter.get("/all", isLoggedIn, isUser, fetchAllRepair);
repairRouter.get("/:id", isLoggedIn, isUser, fetchRepairByID );
repairRouter.get("/", isLoggedIn, isUser, searchRepair);
repairRouter.put("/update/repair-item/:id", isLoggedIn, isUser, updateRepairItem );
repairRouter.put("/:id", isLoggedIn, isUser, updateRepair );
repairRouter.delete("/:id", isLoggedIn, isAdmin, deleteRepair );




// Repair Process Routes
repairRouter.post('/processes', auth, createRepairProcess);
repairRouter.get('/processes', auth, getRepairProcesses);
repairRouter.get('/processes/by-fault/:faultId/:deviceType', auth, getProcessByFault);
repairRouter.put('/processes/:id', auth, updateRepairProcess);

// Repair Tracking Routes
repairRouter.post('/tracking', auth, startRepairTracking);
repairRouter.put('/tracking/:id', auth, updateRepairTracking);
repairRouter.get('/tracking/:repairId/:repairItemIndex', auth, getRepairTracking);



export default repairRouter; 