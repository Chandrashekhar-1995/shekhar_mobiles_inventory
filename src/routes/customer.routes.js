import express from "express";
import { isLoggedIn, isUser, roleBasedAuth, isAdmin } from "../middlewares/auth.middleware.js";
import { createCustomer, fetchCustomerByID, searchCustomers, updateCustomer, deleteCustomer, bulkUploadTemplate, bulkUploadCustomer, } from "../controllers/customer.controllers.js";


const customerRouter = express.Router();


customerRouter.post("/create", isLoggedIn, isUser, createCustomer);
customerRouter.get("/:id", isLoggedIn, isUser,  fetchCustomerByID); 
customerRouter.get("/", isLoggedIn, isUser, searchCustomers);
customerRouter.put("/update/:id", isLoggedIn, isUser, updateCustomer);
customerRouter.delete("/delete/:id", isLoggedIn, isAdmin, deleteCustomer);
customerRouter.get("/bulk-upload/template", isLoggedIn, isUser, bulkUploadTemplate);
customerRouter.post("/bulk-upload", isLoggedIn, roleBasedAuth(["admin"]), bulkUploadCustomer);


export default customerRouter;