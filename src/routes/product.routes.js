import { Router } from "express";
import upload from "../middlewares/upload.middleware.js";
import { isLoggedIn, isUser, roleBasedAuth, isAdmin } from "../middlewares/auth.middleware.js";
import {createProduct, searcProduct, downloadTemplate, bulkUploadProduct,  fetchAllProduct, fetchProductByID, updateProduct, deleteProduct,  } from "../controllers/product.controllers.js";

const productRouter = Router();

productRouter.post("/create", isLoggedIn, isAdmin, createProduct);
productRouter.get("/all", isLoggedIn, isUser, fetchAllProduct);
productRouter.get("/:id", isLoggedIn, isUser, fetchProductByID );
productRouter.get("/", isLoggedIn, isUser, searcProduct);
productRouter.put("/:id", isLoggedIn, isUser, updateProduct );
productRouter.delete("/:id", isLoggedIn, isAdmin, deleteProduct );
productRouter.get("/bulk-upload/template", isLoggedIn, isUser, downloadTemplate);
productRouter.post("/bulk-upload", isLoggedIn, roleBasedAuth(["admin"]), upload.single("file"), bulkUploadProduct);

export default productRouter; 