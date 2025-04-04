import { Router } from "express";
import { userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createUser, fetchAllUser, fetchUserByID, searchUser, updateUser, deleteUser, bulkUploadUserTemplate,  bulkUploadUser } from "../controllers/user.controllers.js";

const userRouter = Router();

// Create User by Admin
userRouter.post("/create", userRegistrationValidator(), validate, createUser);
userRouter.post("/create", isLoggedIn, isAdmin, createUser);
userRouter.get("/all", isLoggedIn, isUser, fetchAllUser);
userRouter.get("/:id", isLoggedIn, isUser, fetchUserByID );
userRouter.get("/", isLoggedIn, isUser, searchUser);
userRouter.put("/:id", isLoggedIn, isUser, updateUser );
userRouter.delete("/:id", isLoggedIn, isAdmin, deleteUser );
userRouter.get("/bulk-upload/template", isLoggedIn, isUser, bulkUploadUserTemplate);
userRouter.post("/bulk-upload", isLoggedIn, roleBasedAuth(["admin"]), bulkUploadUser);

export default userRouter; 