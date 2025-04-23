import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { createRepairInvoice, deleteRepairInvoice, fetchAllRepairInvoice, fetchLastRepairInvoice, fetchRepairInvoiceByID, searchRepairInvoice, updateRepairInvoice } from "../controllers/repair.controllers.js";

const repairRouter = Router();

repairRouter.get("/last-repair", isLoggedIn, isUser, fetchLastRepairInvoice);
repairRouter.post("/create", isLoggedIn, isUser, createRepairInvoice);
repairRouter.get("/all", isLoggedIn, isUser, fetchAllRepairInvoice);
repairRouter.get("/:id", isLoggedIn, isUser, fetchRepairInvoiceByID );
repairRouter.get("/", isLoggedIn, isUser, searchRepairInvoice);
repairRouter.put("/:id", isLoggedIn, isUser, updateRepairInvoice );
repairRouter.delete("/:id", isLoggedIn, isAdmin, deleteRepairInvoice );


export default repairRouter; 