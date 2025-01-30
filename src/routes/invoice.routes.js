const express = require("express");
const invoiceRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const {createInvoice, lastInvoiceFetch} = require("../controllers/invoice.controllers");


invoiceRouter.post("/create", authenticateUser, createInvoice);

// Endpoint to fetch the last invoice
invoiceRouter.get("/last-invoice", authenticateUser, lastInvoiceFetch );



module.exports = invoiceRouter;