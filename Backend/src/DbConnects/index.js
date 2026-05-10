import mongoose from "mongoose";

async function dbConnects(){
    try {
        const connection= await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully:", connection.connection.host);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export default dbConnects;
