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
import authRouter from "./routes/auth.routes.js";
// const brandRouter = require("./routes/brand.routes");
// const categoryRouter = require("./routes/category.routes");
// const productRouter = require("./routes/product.routes");
// const profileRouter =require("./routes/profile.routes");
// const invoiceRouter = require("./routes/invoice.routes");
// const purchaseInvoiceRouter = require("./routes/purchaseInvoice.routes");
// const customerRouter = require("./routes/customer.routes");
// const accountRouter =require("./routes/account.routes");
// const mobileRouter = require("./routes/mobile.routes");
import {errorHandler} from "./middlewares/errorHandler.middleware.js";


app.use("/api/v1/", authRouter );
// app.use("/api/v1/", brandRouter );
// app.use("/api/v1/", categoryRouter );
// app.use("/api/v1/product", productRouter );
// app.use("/api/v1/", profileRouter );
// app.use("/api/v1/", accountRouter );
// app.use("/api/v1/invoice/", invoiceRouter );
// app.use("/api/v1/purchase-invoice/", purchaseInvoiceRouter);
// app.use("/api/v1/", customerRouter );
// app.use("/api/v1/mobile", mobileRouter );

// Error Handler Middleware (must be after all routes)
app.use(errorHandler);


export default app;