const mongoose = require("mongoose")

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Database Connected Successfully");
    }
    catch{
        console.log("Database not Connected!" + error);
    }
}

module.exports = connectDB
