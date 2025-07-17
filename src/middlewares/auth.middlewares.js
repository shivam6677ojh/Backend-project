
import { user } from "../models/user.model.js";
import { ApiHandleError } from "../utils/apierrorhandle.js";
import { asynHandler } from "../utils/asynHandler.js";
import jwt from "jsonwebtoken"

export const verifyJwt = (asynHandler(async(req,res,next)=>{
    try {
        const token = res.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");
    
        if(!token){
            throw new ApiHandleError(401,"Token not present !! (Unauthorized request!)");
        }
    
        const decodedinformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const storeuser = user.findById(decodedinformation?._id).select("-password -refreshToken");
    
        if(!storeuser){
            throw new ApiHandleError(401, "Invalid access token");
        }
    
        req.storeuser = storeuser;
        next();
    } catch (error) {
        throw new ApiHandleError(401, error?.message || "Invalid AcessToken");
    }
}))