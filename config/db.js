const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongodb sucessfully connected✈️");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // Stop the app if DB fails
  }
};

module.exports = connectDB;
