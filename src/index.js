// require("dotenv").config({path:"/.env"});
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/db.js";


import "dotenv/config";

console.log(process.env.MONGODB_URI);


connectDB();















/*
import express from "express";
const app = express();

(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODBURI}/${DB_NAME}`)
        app.on("Error",(err)=>{
            console.log("Error: ",err);
            throw err;
        })
           app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
           })
    }catch(err){
        console.log("Error: ",err);
        throw err;
    }
})();
*/