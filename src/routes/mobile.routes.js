const express = require("express");
const mobileRouter = express.Router();
const { authenticateUser } = require("../middlewares/auth.middleware");
const { createMobile } = require("../controllers/mobile.controllers");


mobileRouter.post("/create", authenticateUser, createMobile);

module.exports = mobileRouter;