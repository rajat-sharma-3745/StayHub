import mongoose from "mongoose";


export const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");
    } catch (error) {
        console.log("Error connecting database :",error)
        process.exit(1);
    }
}

