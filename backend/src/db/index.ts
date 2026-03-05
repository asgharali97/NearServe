import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if(!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URI is not defined");
    }
    const connection = await mongoose.connect(`${process.env.MONGODB_URL}` as any);
  } catch (error) {
    console.log("Error connecting to MongoDB :", error);
    process.exit(1);
  }
};

export default connectDB;
