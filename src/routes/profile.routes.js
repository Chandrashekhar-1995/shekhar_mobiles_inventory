import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { changePassword, deleteMyProfile, getMyProfile } from "../controllers/profile.controllers.js";

const profileRouter = express.Router();

profileRouter.get("/", isLoggedIn, getMyProfile);
profileRouter.put("/change-password", isLoggedIn, changePassword);
profileRouter.delete("/delete", isLoggedIn, deleteMyProfile);

export default profileRouter;
