require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const profileRouter =require("./routes/profile.routes");
const categoryRouter = require("./routes/category.routes");
const errorHandler = require("./middlewares/errorHandler.middleware");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/", authRoutes );
app.use("/api/v1/", profileRouter );
app.use("/api/v1/", categoryRouter );


// Error Handler Middleware (must be after all routes)
app.use(errorHandler);


// Connect to database and start server
connectDB()
.then(() => {
  app.listen(PORT, () => {
      console.log(`Server is running successfully on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("Failed to start the server due to database connection issues", err);
});