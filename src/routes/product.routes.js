const express = require("express");
const router = express.Router();

// Define product-specific routes
router.get("/", (req, res) => {
  res.send("Get all products");
});

router.post("/", (req, res) => {
  res.send("Add a new product");
});

module.exports = router;
