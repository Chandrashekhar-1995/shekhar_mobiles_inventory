import { Router } from "express";
import { isLoggedIn, isUser, isAdmin } from "../middlewares/auth.middleware.js";
import {createMobile, searchMobile, fetchAllMobile, fetchMobileByID, updateMobile, deleteMobile,  } from "../controllers/mobile.controllers.js";

const mobileRouter = Router();

mobileRouter.post("/create", isLoggedIn, isUser, createMobile);
mobileRouter.get("/all", isLoggedIn, isUser, fetchAllMobile);
mobileRouter.get("/:id", isLoggedIn, isUser, fetchMobileByID );
mobileRouter.get("/", isLoggedIn, isUser, searchMobile);
mobileRouter.put("/:id", isLoggedIn, isUser, updateMobile );
mobileRouter.delete("/:id", isLoggedIn, isAdmin, deleteMobile );

export default mobileRouter; 