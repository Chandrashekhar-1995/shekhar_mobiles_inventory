const express = require("express");
const router = express.Router();
const { searchCustomers } = require("../controllers/customer.controllers");

const customerRouter = express.Router();

// Search customers endpoint
customerRouter.get("/auth/customer", searchCustomers);

module.exports = customerRouter;