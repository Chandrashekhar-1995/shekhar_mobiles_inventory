require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const connectDB = require("./config/database");
const authRouter = require("./routes/auth.routes");
const brandRouter = require("./routes/brand.routes");
const categoryRouter = require("./routes/category.routes");
const productRouter = require("./routes/product.routes");
const profileRouter =require("./routes/profile.routes");
const invoiceRouter = require("./routes/invoice.routes");
const customerRouter = require("./routes/customer.routes");
const accountRouter =require("./routes/account.routes");
const errorHandler = require("./middlewares/errorHandler.middleware");


// this code only create upload folder-
// const fs = require("fs");
// const path = require("path");

// const uploadDirectory = path.join(__dirname, "./uploads");
// // Check if uploads directory exists, create if not
// if (!fs.existsSync(uploadDirectory)) {
//   fs.mkdirSync(uploadDirectory, { recursive: true });
//   console.log(`Directory ${uploadDirectory} created.`);
// };

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials:true,
}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/", authRouter );
app.use("/api/v1/", brandRouter );
app.use("/api/v1/", categoryRouter );
app.use("/api/v1/", productRouter );
app.use("/api/v1/", profileRouter );
app.use("/api/v1/", accountRouter );
app.use("/api/v1/", invoiceRouter );
app.use("/api/v1/", customerRouter );


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