import { Router } from "express";
const userRouter = Router();


import { userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { create } from "../controllers/user.controllers.js";


// Create User by Admin
userRouter.post("/create", userRegistrationValidator(), validate, create);

export default userRouter; 