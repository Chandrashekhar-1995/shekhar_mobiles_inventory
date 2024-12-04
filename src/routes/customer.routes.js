const express = require("express");
const router = express.Router();

// Define customer-specific routes
router.get("/", (req, res) => {
  res.send("Get all customers");
});

router.post("/", (req, res) => {
  res.send("Create a customer");
});

module.exports = router;
