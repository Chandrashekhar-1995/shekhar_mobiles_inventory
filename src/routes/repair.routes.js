import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { createRepair, deleteRepair, fetchAllRepair, fetchLast90DaysRepairBookingData, fetchLastRepair, fetchRepairByID, fetchTodayRepairBookingSummary, searchRepair, updateRepair, updateRepairItem } from "../controllers/repair.controllers.js";


const repairRouter = Router();

repairRouter.get("/last-repair", isLoggedIn, isUser, fetchLastRepair);
repairRouter.post("/create", isLoggedIn, isUser, createRepair);
repairRouter.get("/all", isLoggedIn, isUser, fetchAllRepair);
repairRouter.get("/last-90days-repair-booking", isLoggedIn, isUser, fetchLast90DaysRepairBookingData);
repairRouter.get("/today-repair-Booking-summary", isLoggedIn, isUser, fetchTodayRepairBookingSummary);
repairRouter.get("/:id", isLoggedIn, isUser, fetchRepairByID );
repairRouter.get("/", isLoggedIn, isUser, searchRepair);
repairRouter.put("/update/repair-item/:id", isLoggedIn, isUser, updateRepairItem );
repairRouter.put("/:id", isLoggedIn, isUser, updateRepair );
repairRouter.delete("/:id", isLoggedIn, isAdmin, deleteRepair );



export default repairRouter; 