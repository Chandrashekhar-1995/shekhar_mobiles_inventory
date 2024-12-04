const express = require("express");
const router = express.Router();

// Define user-specific routes
router.get("/", (req, res) => {
  res.send("Get all users");
});

router.post("/", (req, res) => {
  res.send("Create a user");
});

module.exports = router;
