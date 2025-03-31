import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const healthCheck = asyncHandler((req, res) => {
  console.log("logic to connect with db");
  
  res.status(200).json(new ApiResponse(200, {}, "Server is running" ));
});

export { healthCheck };
