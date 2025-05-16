import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { updateRepairProcess } from "../controllers/faultRepairing.controllers.js";

const faultRepairingRouter = Router();

faultRepairingRouter.get("/:repairId/items/:repairingIndex/process", isLoggedIn, isUser, updateRepairProcess);

export default faultRepairingRouter; 