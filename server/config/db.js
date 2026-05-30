const mongoose = require("mongoose");
require("dotenv").config();
const dns=require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;