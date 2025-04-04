import express from "express";
import { isAdmin, isLoggedIn, isUser } from "../middlewares/auth.middleware.js";
import { createBrand, fetchAllBrand, fetchBrandByID, searchBrand, updateBrand, deleteBrand } from "../controllers/brand.controllers.js";

const brandRouter = express.Router();


// create account
brandRouter.post("/create", isLoggedIn, isAdmin, createBrand );
brandRouter.get("/all", isLoggedIn, isUser, fetchAllBrand);
brandRouter.get("/:id", isLoggedIn, isUser, fetchBrandByID );
brandRouter.get("/", isLoggedIn, isUser, searchBrand);
brandRouter.put("/:id", isLoggedIn, isUser, updateBrand );
brandRouter.delete("/:id", isLoggedIn, isAdmin, deleteBrand );


export default brandRouter;