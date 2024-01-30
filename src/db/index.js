import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let connectionInstance;

const connectDB = async () => {
  try {
    if (connectionInstance) {
      console.log("MongoDB already connected");
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
      
    });

    // Save the connection instance
    connectionInstance = mongoose.connection;

    console.log(`\nMongoDB connected || DB host: ${connectionInstance.host}`);
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;





// import mongoose from "mongoose";

// import {DB_NAME} from "../constants.js";

// const connectDB = async() => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         console.log(`\n MONGODB connected || DB host : ${connectionInstance.connection.host}`);

//     }

//     catch (error){
//         console.log("MONGODB connection error",error);
//         process.exit(1)
//     }
// }

// export default connectDB