require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/database");
const userRoutes = require("./routes/user.routes");
const customerRoutes = require("./routes/customer.routes");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1/users", userRoutes );
app.use("/api/v1/customers", customerRoutes );


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