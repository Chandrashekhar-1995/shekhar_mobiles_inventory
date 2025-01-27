const express = require("express");
const { authenticateUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { searcProducts, createProduct, downloadTemplate, bulkUploadProduct } = require("../controllers/product.controllers");

const productRouter = express.Router();

productRouter.post("/product/create", authenticateUser, createProduct);
productRouter.get("/auth/product", authenticateUser, searcProducts);
productRouter.get("/product/template", authenticateUser, downloadTemplate);
productRouter.post("/product/bulk-upload", upload.single("file"), bulkUploadProduct);


module.exports = productRouter;