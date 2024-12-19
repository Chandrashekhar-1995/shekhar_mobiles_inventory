const Product = require("../models/Product.model");
const ApiError = require("../utils/ApiError");

// Helper function to calculate total and process items
const processItems = async (items) => {
    let totalAmount = 0;
    const itemDetails = [];
  
    for (const item of items) {
        // Fetch the product from the database
        const product = await Product.findById(item.item);
        if (!product) {
            throw new ApiError(404, `Item with ID ${item.item} not found.`);
        }
  
        // // Check if the stock is sufficient
        // if (product.stockQuantity < item.quantity) {
        //     throw new ApiError(400, `Insufficient stock for item: ${product.productName}`);
        // }
  
        // Set salePrice if not provided
        const salePrice = item.salePrice || product.salePrice;
  
        // Calculate the total for this item
        const itemTotal = salePrice * item.quantity;
        totalAmount += itemTotal;
  
        // Push the item details
        itemDetails.push({
            item: item.item,
            quantity: item.quantity,
            salePrice,
            total: itemTotal,
        });
  
        // Reduce the stock quantity
        product.stockQuantity -= item.quantity;
        await product.save();
    }
  
    return { itemDetails, totalAmount };
  };


  module.exports = processItems;
  