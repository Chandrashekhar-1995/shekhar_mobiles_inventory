import express from "express";
import { isAdmin, isLoggedIn, isUser } from "../middlewares/auth.middleware.js";
import { createModelNo, deleteModel, fetchAllModelNo, fetchModelNoByID, searchModelNo, updateModelNo } from "../controllers/modelNo.controllers.js";

const modelNoRouter = express.Router();

// create account
modelNoRouter.post("/create", isLoggedIn, isUser, createModelNo );
modelNoRouter.get("/all", isLoggedIn, isUser, fetchAllModelNo);
modelNoRouter.get("/:id", isLoggedIn, isUser, fetchModelNoByID);
modelNoRouter.get("/", isLoggedIn, isUser, searchModelNo);
modelNoRouter.put("/:id", isLoggedIn, isUser, updateModelNo );
modelNoRouter.delete("/:id", isLoggedIn, isAdmin, deleteModel );

export default modelNoRouter;