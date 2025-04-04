import express from "express";
import { isAdmin, isLoggedIn, isUser } from "../middlewares/auth.middleware.js";
import { createAccount, fetchAllAccount, fetchAccountByID, searchAccount, updateAccount, deleteAccount } from "../controllers/account.controllers.js";

const accountRouter = express.Router();


// create account
accountRouter.post("/create", isLoggedIn, isAdmin, createAccount );
accountRouter.get("/all", isLoggedIn, isUser, fetchAllAccount );
accountRouter.get("/:id", isLoggedIn, isUser, fetchAccountByID );
accountRouter.get("/", isLoggedIn, isUser, searchAccount );
accountRouter.put("/:id", isLoggedIn, isUser, updateAccount );
accountRouter.delete("/:id", isLoggedIn, isAdmin, deleteAccount );


export default accountRouter;
