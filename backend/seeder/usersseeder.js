import dotenv from 'dotenv';
import mongoose from 'mongoose';
import users from '../models/users.js';
import userModel from '../models/user.js';
import user from '../models/user.js';
import express from 'express';
import cors from 'cors';


// dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect("mongodb://127.0.0.1:27017/kangan");

const importData = async () => {
    try {
        await user.deleteMany();
        const createdUsers = await userModel.insertMany(users);
        console.log("Data Imported Successfully!");
        console.log(createdUsers)
        process.exit();
    } catch (error) {
        console.error("Error importing data");
        console.log(error);
        process.exit(1);
    }
}

const destroyData = async () => {
    try {
        await user.deleteMany();
        console.log("Data Destroyed");
        process.exit();
    } catch (error) {
        console.error("Error while destroying data");
        console.log(error);
        process.exit(1);
    }
} 
console.log(process.argv[2]);
if (process.argv[2] === '-d') {
    destroyData();
}
else {
    importData();
}   