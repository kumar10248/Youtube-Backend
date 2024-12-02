// require("dotenv").config({path:"/.env"});
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/db.js";

import {app} from "./app.js";
import "dotenv/config";

console.log(process.env.MONGODB_URI);


connectDB()
.then(()=>{
    app.listen(process.env.PORT ||8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })

})
.catch((err)=>{
    console.log("Error: ",err);
    throw err
  
})















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