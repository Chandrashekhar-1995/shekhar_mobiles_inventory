import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config({
    path: "./.env",
  });


const PORT = process.env.PORT || 7777;
  
connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
    })
    .catch((err) => {
      console.error("Mongodb connection error", err);
      process.exit(1);
    });
