import mongoose from "mongoose";
mongoose.set('strictQuery', true);
/**
 * Function to establish a connection to the database
 */
const connectToDatabase = async (): Promise<void> => {
  try {
    // Connect to the database using the environment variable for the URI
    await mongoose.connect(process.env.DB as string, {
      // Additional options can be specified here if needed
    });
    console.log("Connected to the database successfully");
  } catch (error) {
    console.error("Could not connect to the database!", error);
  }
};

export default connectToDatabase;