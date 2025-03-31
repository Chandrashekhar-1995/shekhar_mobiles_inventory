import { Router } from "express";
const authRouter = Router();

import { findUserOrCustomer } from "../utils/dbHelpers.js";
import { login, logout, register, registerAdmin } from "../controllers/auth.controllers.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";


// Register customer
authRouter.post("/register", userRegistrationValidator(), validate, register);

// Register admin
authRouter.post("/ManojChandraAjay@hgtfrgerj/jhds/jhgecfhgd/hjgef/vgd/hgfvedhv/ghdsv/gvsdgvedf/562134wefgr763478cvdsfcjkbhs/register-admin", userRegistrationValidator(), validate, registerAdmin);
 
// Login
authRouter.get("/login", userLoginValidator(), validate, login);


// Logout
authRouter.post("/logout", logout);

export default authRouter; 

