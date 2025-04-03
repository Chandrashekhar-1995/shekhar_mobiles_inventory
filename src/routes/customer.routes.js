import express from "express";
import { isLoggedIn, isUser, } from "../middlewares/auth.middleware.js";
import { createCustomer, fetchCustomerByID, searchCustomers, updateCustomer, deleteCustomer, } from "../controllers/customer.controllers.js";


const customerRouter = express.Router();


customerRouter.post("/create", isLoggedIn, isUser, createCustomer);
customerRouter.get("/:id", isLoggedIn, isUser,  fetchCustomerByID);
customerRouter.get("/", isLoggedIn, isUser, searchCustomers);


export default customerRouter;