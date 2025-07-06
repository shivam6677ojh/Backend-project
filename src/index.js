// till this it is good but and its work fine but better version from this
// require('dotenv').config({path : './env'}) 

import dotenv from 'dotenv'
import connectDB from "./db/index.js"
import express from "express"
 
const app = express()

app.use(express.json());

dotenv.config({
    path: './env'
})

connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        // console.log(`Server is running on PORT: ${process.env.PORT}`);
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
})
.catch((err) => {
    console.log("MongoDB connection Failed: ", err);
})

import { userRouter } from './routes/user.routes.js';

app.use('/api/v1/users', userRouter)

// app.get('/', (req,res) => {
//     res.send("Yes Api is working");
// })


/*
import express from "express"
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
const app = express();

// function connectDB() {

// }

// connectDB(); use this if needed but best to use immidiate execute function

( async () => {
    try{
        await mongoose.connect(`${process.env.MONGOBD_URL}/${DB_NAME}`);
        app.on("error", ()=> {
            console.log("Error",error);
            throw error;
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listing on ${process.env.PORT}`);
        })
        
    }catch(error){
        console.error("Error:",error);
        throw error
    }
})()

*/