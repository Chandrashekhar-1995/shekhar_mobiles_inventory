import { Router } from "express";
const authRouter = Router();
import { checkAuth, login, logout, register, registerAdmin } from "../controllers/auth.controllers.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";


// Register customer
authRouter.get("/check", isLoggedIn, checkAuth);

// Register customer
authRouter.post("/register", userRegistrationValidator(), validate, register);

// Register admin
authRouter.post("/ManojChandraAjay@hgtfrgerj/jhds/jhgecfhgd/hjgef/vgd/hgfvedhv/ghdsv/gvsdgvedf/562134wefgr763478cvdsfcjkbhs/register-admin", userRegistrationValidator(), validate, registerAdmin);
 
// Login
authRouter.post("/login", userLoginValidator(), validate, login);

authRouter.post("/logout", logout);

export default authRouter; 

