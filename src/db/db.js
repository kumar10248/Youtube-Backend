import mongoose from 'mongoose';


const connectDB = async () => {
    try {
      const connectionInstance=  await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`\n Connected to MongoDB !! DB Host: ${connectionInstance.connection.host}` );
    } catch (err) {
        console.error("MongoDb connection Error: ",err);
        process.exit(1);
    }
}

export default connectDB;