import express from "express";
import { isAdmin, isLoggedIn, isUser } from "../middlewares/auth.middleware.js";
import { createCategory, deleteCategory, fetchAllCategory, fetchCategoryByID, searchCategory, updateCategory } from "../controllers/category.controllers.js";

const categoryRouter = express.Router();

categoryRouter.post("/create", isLoggedIn, isAdmin, createCategory);
categoryRouter.get("/all", isLoggedIn, isUser, fetchAllCategory);
categoryRouter.get("/:id", isLoggedIn, isUser, fetchCategoryByID );
categoryRouter.get("/", isLoggedIn, isUser, searchCategory);
categoryRouter.put("/:id", isLoggedIn, isUser, updateCategory );
categoryRouter.delete("/:id", isLoggedIn, isAdmin, deleteCategory );


export default categoryRouter;
