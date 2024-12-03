const express = require("express");
const router = express.Router();
const ApiResponse = require("./utils/ApiResponse");
const ApiError = require("./utils/ApiError");
const asyncHandler = require("./utils/asyncHandler");


// Example route handlers with asyncHandler
router.get(
    '/',
    asyncHandler(async (req, res) => {
      const data = { message: 'Shekhar Mobiles Inventory API is running!' };
      res.status(200).json(new ApiResponse(200, data, 'API is healthy'));
    })
  );
  
  // Simulate a route that throws an error
  router.get(
    '/error',
    asyncHandler(async (req, res) => {
      throw new ApiError(400, 'This is a simulated error!');
    })
  );
  
  module.exports = router;