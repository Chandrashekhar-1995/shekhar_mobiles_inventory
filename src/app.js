import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials:true,
  }));
  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import customerRouter from "./routes/customer.routes.js";
import profileRouter from "./routes/profile.routes.js";
import accountRouter from "./routes/account.routes.js";
import brandRouter from "./routes/brand.routes.js";
import categoryRouter from "./routes/category.routes.js";
// const productRouter = require("./routes/product.routes");
// const invoiceRouter = require("./routes/invoice.routes");
// const purchaseInvoiceRouter = require("./routes/purchaseInvoice.routes");
// const mobileRouter = require("./routes/mobile.routes");
import {errorHandler} from "./middlewares/errorHandler.middleware.js";


app.use("/api/v1/healthcheck", healthCheckRouter );
app.use("/api/v1/auth", authRouter );
app.use("/api/v1/user", userRouter );
app.use("/api/v1/customer", customerRouter );
app.use("/api/v1/profile", profileRouter );
app.use("/api/v1/account", accountRouter );
app.use("/api/v1/brand", brandRouter );
app.use("/api/v1/category", categoryRouter );
// app.use("/api/v1/product", productRouter );
// app.use("/api/v1/invoice/", invoiceRouter );
// app.use("/api/v1/purchase-invoice/", purchaseInvoiceRouter);
// app.use("/api/v1/mobile", mobileRouter );

// Error Handler Middleware (must be after all routes)
app.use(errorHandler);


export default app;