const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connection successfully!!");
    } catch (error) {
        console.error("Database connection failed!!", error.message);
        process.exit(1);
    }
};

module.exports = connectDb;
