const express = require("express");
const invoiceRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const {createInvoice, lastInvoiceFetch, allInvoiceFetch, invoiceFetchById, updateInvoice } = require("../controllers/invoice.controllers");


invoiceRouter.post("/create", authenticateUser, createInvoice);
// Endpoint to fetch the last invoice
invoiceRouter.get("/last-invoice", lastInvoiceFetch );

invoiceRouter.get("/all-invoice", allInvoiceFetch );
invoiceRouter.get("/:id", invoiceFetchById );
invoiceRouter.patch("/:id", authenticateUser, updateInvoice );



module.exports = invoiceRouter;