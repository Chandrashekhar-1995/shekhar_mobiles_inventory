import express from "express";
import { isAdmin, isLoggedIn, isUser } from "../middlewares/auth.middleware.js";
import { addSubFault, createFault, deleteFault, fetchAllFault, fetchFaultByID, searchFault, updateFault } from "../controllers/fault.controllers.js";

const faultRouter = express.Router();


// create account
faultRouter.post("/create", isLoggedIn, isAdmin, createFault );
faultRouter.get("/all", isLoggedIn, isUser, fetchAllFault);
faultRouter.get("/:id", isLoggedIn, isUser, fetchFaultByID );
faultRouter.get("/", isLoggedIn, isUser, searchFault);
faultRouter.put("/:id", isLoggedIn, isUser, updateFault );
faultRouter.delete("/:id", isLoggedIn, isAdmin, deleteFault );
faultRouter.post("/add-subFault", isLoggedIn, isAdmin, addSubFault );


export default faultRouter;