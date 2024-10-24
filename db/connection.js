const mongoose = require("mongoose");

const connectDb = async(req,res) => {
     try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("database connection successfully!!")
     } catch (error) {
        console.log("database connection failed!!")
     }
}

module.exports = connectDb;