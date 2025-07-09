import { asynHandler } from "../utils/asynHandler.js";
import { ApiHandleError } from "../utils/apierrorhandle.js";
import { user } from "../models/user.model.js"
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";


function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


const registerUser = asynHandler(async (req, res) => {

    // get data from user frontend
    // validation - non empty
    // check if user alredy exists: username, email
    // check image, avtar
    // upload them to cloudinary
    // create user object - create entry in db
    // remove password and refresh token fields from responce
    // check for user creation
    // return ans

    res.status(200).json({
        message: "ok"
    })

    const { email, password, fullname, username } = req.body
    console.log("email", email);

    // if(fullname === ""){
    //     throw new ApiHandleError(400,"fullname required")
    // } we can do this for each fields but multer best method is below;

    if (
        [email, fullname, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiHandleError(400, "Enter all required detail");
    }

    if (validateEmail(email)) {
        console.log("Valid Email ✅");
    } else {
        console.log("Invalid Email ❌");
    }

    const existeduser = user.findOne({
        $or: [{ username }, { email }]
    })

    if (existeduser) {
        throw new ApiHandleError(409, "user with email or username is already existed")
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avtarLocalPath) {
        throw new ApiHandleError(400, "Avtar is needed provide it")
    }

    const avtar = await uploadoncloudinary(avtarLocalPath);
    const coverImage = await uploadoncloudinary(coverImageLocalPath);

    if (!avtar) {
        throw new ApiHandleError(400, "Avtar is needed provide it")
    }

    const User = await user.create({
        fullname,
        avtar : avtar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await user.findById(User._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiHandleError(500,"Something went wrong while register user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "yes User created Successfuly")
    )
})


export { registerUser }