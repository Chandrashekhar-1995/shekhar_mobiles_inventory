import express from "express";
import { isLoggedIn, isUser, roleBasedAuth, isAdmin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { createCustomer, fetchAllCustomer, fetchCustomerByID, searchCustomers, updateCustomer, deleteCustomer, bulkUploadTemplate, bulkUploadCustomer, } from "../controllers/customer.controllers.js";


const customerRouter = express.Router();


customerRouter.post("/create", isLoggedIn, isUser, createCustomer);
customerRouter.get("/:id", isLoggedIn, isUser,  fetchCustomerByID); 
customerRouter.get("/all", isLoggedIn, isUser, fetchAllCustomer);
customerRouter.get("/", isLoggedIn, isUser, searchCustomers);
customerRouter.put("/:id", isLoggedIn, isUser, updateCustomer);
customerRouter.delete("/:id", isLoggedIn, isAdmin, deleteCustomer);
customerRouter.get("/bulk-upload/template", isLoggedIn, isUser, bulkUploadTemplate);
customerRouter.post("/bulk-upload", isLoggedIn, roleBasedAuth(["admin"]), upload.single("file"), bulkUploadCustomer);


export default customerRouter;