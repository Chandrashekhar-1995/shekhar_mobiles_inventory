const express = require("express");
const purchaseInvoiceRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const {
    createPurchaseInvoice,
    lastPurchaseInvoiceFetch,
    allPurchaseInvoiceFetch,
    purchaseInvoiceFetchById,
    updatePurchaseInvoice
} = require("../controllers/purchaseInvoice.controllers");

purchaseInvoiceRouter.post("/create", authenticateUser, createPurchaseInvoice);
purchaseInvoiceRouter.get("/last-invoice", lastPurchaseInvoiceFetch);
purchaseInvoiceRouter.get("/all-invoice", allPurchaseInvoiceFetch);
purchaseInvoiceRouter.get("/:id", purchaseInvoiceFetchById);
purchaseInvoiceRouter.patch("/:id", authenticateUser, updatePurchaseInvoice);

module.exports = purchaseInvoiceRouter;