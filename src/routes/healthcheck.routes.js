import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controllers.js";
const healthCheckRouter = Router();

healthCheckRouter.get("/", healthCheck);

export default healthCheckRouter;
