import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' 

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json("limit: 16kb"))
app.use(express.urlencoded({extended: true, limit: "16kb"})) 
app.use(express.static("public"))
app.use(cookieParser())


// routes import
// import { userRouter } from './routes/user.routes.js'; this is applicatble in index.js


// routes declaration

// app.use('/api/v1/users', userRouter)

// example how url work??
// it will work like this
// https://localhost:8000/users/register
// https://localhost:8000/users/login

export { app }