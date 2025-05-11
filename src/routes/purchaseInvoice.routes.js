import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import { fetchLastPurchaseInvoice, createPurchaseInvoice, fetchAllPurchaseInvoice,  fetchPurchaseInvoiceByID, searchPurchaseInvoice, updatePurchaseInvoice,  deletePurchaseInvoice, getLast90DaysPurchases, getTodayPurchaseSummary } from "../controllers/purchaseInvoice.controllers.js";

const purchaseInvoiceRouter = Router();

purchaseInvoiceRouter.get("/last-invoice", isLoggedIn, isAdmin, fetchLastPurchaseInvoice);
purchaseInvoiceRouter.post("/create", isLoggedIn, isAdmin, createPurchaseInvoice);
purchaseInvoiceRouter.get("/all", isLoggedIn, isUser, fetchAllPurchaseInvoice);
purchaseInvoiceRouter.get("/last-90days-purchases", isLoggedIn, isUser, getLast90DaysPurchases);
purchaseInvoiceRouter.get("/today-purchase-summary", isLoggedIn, isUser, getTodayPurchaseSummary);
purchaseInvoiceRouter.get("/:id", isLoggedIn, isUser, fetchPurchaseInvoiceByID );
purchaseInvoiceRouter.get("/", isLoggedIn, isUser, searchPurchaseInvoice);
purchaseInvoiceRouter.put("/:id", isLoggedIn, isUser, updatePurchaseInvoice);
purchaseInvoiceRouter.delete("/:id", isLoggedIn, isAdmin, deletePurchaseInvoice);


export default purchaseInvoiceRouter; 