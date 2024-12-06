require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const profileRouter =require("./routes/profile.routes");
const customerRoutes = require("./routes/customer.routes");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/", authRoutes );
app.use("/api/v1/", profileRouter );
app.use("/api/v1/", customerRoutes );


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