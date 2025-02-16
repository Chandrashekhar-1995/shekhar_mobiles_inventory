const express = require("express");
const invoiceRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const {createInvoice, lastInvoiceFetch, allInvoiceFetch} = require("../controllers/invoice.controllers");


invoiceRouter.post("/create", authenticateUser, createInvoice);

// Endpoint to fetch the last invoice
invoiceRouter.get("/last-invoice", authenticateUser, lastInvoiceFetch );
//fetch all invoices
invoiceRouter.get("/all-invoice", authenticateUser, allInvoiceFetch );



module.exports = invoiceRouter;