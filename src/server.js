require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const app = require("./app");
const connectDB = require("./config/database");
const ApiError = require("./utils/ApiError");
const ApiResponse = require("./utils/ApiResponse");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = express();

    // Middleware for secure headers
    server.use(helmet());

    // Middleware for logging requests
    server.use(morgan("dev"));

    // Middleware to enable CORS
    server.use(cors());

    // Middleware for parsing JSON and URL-encoded data
    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));

    // Attach the application routes
    server.use("/api/v1", app);

    // Handle 404 - Not Found
    server.use((req, res, next) => {
      res.status(404).json(new ApiResponse(404, null, "Resource not found", false));
    });

    // Global error handler
    server.use((err, req, res, next) => {
      if (err instanceof ApiError) {
        res.status(err.statusCode).json({
          success: false,
          message: err.message,
          errors: err.errors || [],
        });
      } else {
        console.error(err.stack);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    });

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Start the server after connecting to the database
startServer();