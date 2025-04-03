import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createCustomer, fetchCustomerByID, searchCustomers, updateCustomer, deleteCustomer, } from "../controllers/customer.controllers.js";


const customerRouter = express.Router();


customerRouter.post("/create", isLoggedIn, createCustomer);


export default customerRouter;