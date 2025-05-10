import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { fetchLastInvoice, createInvoice, fetchAllInvoice, fetchInvoiceByID, searchInvoice, updateInvoice, deleteInvoice, getLast90DaysSales, getTodaySalesSummary } from "../controllers/invoice.controllers.js";

const invoiceRouter = Router();

invoiceRouter.get("/last-invoice", isLoggedIn, isUser, fetchLastInvoice);
invoiceRouter.post("/create", isLoggedIn, isUser, createInvoice);
invoiceRouter.get("/all", isLoggedIn, isUser, fetchAllInvoice);
invoiceRouter.get("/last-90days-sales", isLoggedIn, isUser, getLast90DaysSales);
invoiceRouter.get("/today-sales-summary", isLoggedIn, isUser, getTodaySalesSummary);
invoiceRouter.get("/:id", isLoggedIn, isUser, fetchInvoiceByID );
invoiceRouter.get("/", isLoggedIn, isUser, searchInvoice);
invoiceRouter.put("/:id", isLoggedIn, isUser, updateInvoice );
invoiceRouter.delete("/:id", isLoggedIn, isAdmin, deleteInvoice );


export default invoiceRouter; 