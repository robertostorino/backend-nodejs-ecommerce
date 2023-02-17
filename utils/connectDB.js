import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();


const connectDB = async () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGOOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
};

export { connectDB }