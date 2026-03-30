import mongoose from 'mongoose';
import env from './env.js';

async function connectDB() {
    await mongoose.connect(env.dbUrl);
    console.log("Connected to DB");
}

export default connectDB;