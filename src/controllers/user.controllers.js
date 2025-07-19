import { asynHandler } from "../utils/asynHandler.js";
import { ApiHandleError } from "../utils/apierrorhandle.js";
import { user } from "../models/user.model.js"
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import jwt from "jsonwebtoken"


const genrateAcessandRefreshToken = async (userId) => {
    try {
        const genuser = await user.findById(userId)
        if (!genuser) {
            throw new ApiHandleError("User not found while generating tokens");
        }
        if (typeof genuser.genrateAccessToken !== "function" || typeof genuser.genrateRefreshToken !== "function") {
            throw new ApiHandleError("Token generation methods not found on user model");
        }
        // console.log(genuser);
        const accessToken = await genuser.genrateAccessToken()
        const refreshToken = await genuser.genrateRefreshToken()
        // console.log("accessToken:", accessToken)
        // console.log("refreshToken:", refreshToken)

        genuser.refreshToken = refreshToken
        await genuser.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.log(error);
        throw new ApiHandleError("Some thing went wrong wile genrating refresh and access token")
    }
}

// function validateEmail(email) {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
// }


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

    // res.status(200).json({
    //     success: true,
    //     message: "ok",
    // })

    const { email, password, fullname, username } = req.body
    // console.log("email", email);
    // console.log(req.body);


    // if(fullname === ""){
    //     throw new ApiHandleError(400,"fullname required")
    // } we can do this for each fields but multer best method is below;

    if (
        [email, fullname, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiHandleError(400, "Enter all required detail");
    }

    // if (validateEmail(email)) {
    //     console.log("Valid Email ✅");
    // } else {
    //     console.log("Invalid Email ❌");
    // }

    const existeduser = await user.findOne({
        $or: [{ username }, { email }]
    })

    if (existeduser) {
        throw new ApiHandleError(409, "user with email or username is already existed")
        // return res.status(409).json({
        //     success: false,
        //     message: "User with email or username already exists"
        // });
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(req.files);

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
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await user.findById(User._id).select("-password -refreshToken") // this line do in postman api remove -password and -refreshToken

    if (!createdUser) {
        throw new ApiHandleError(500, "Something went wrong while register user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "yes User created Successfuly")
    )


    // res.status(200).json({
    //     success: true,
    //     message: "ok"
    // })


})

const loginUser = asynHandler(async (req, res) => {
    // steps what we have to do
    // req.body take user data
    // username or email
    // find the user
    // check for password
    // refresh token and access token;
    // send cookies

    const { username, email, password } = req.body
    console.log(email)

    if (!username && !email) {
        throw new ApiHandleError(400, "username and password is required")
    }

    const Userdata = await user.findOne({
        $or: [{ email }, { username }]
    })

    if (!Userdata) {
        throw new ApiHandleError(400, "Need atleast username or password no user exist")
    }

    const ispasswordvalidate = await Userdata.isCorrectPassword(password)

    if (!ispasswordvalidate) {
        throw new ApiHandleError(401, "in valid password");
    }

    const { accessToken, refreshToken } = await genrateAcessandRefreshToken(Userdata._id)

    const loggedInUser = await user.findById(Userdata._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user LoggedIn successfully"
            )
        )
})

const logoutUser = asynHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.user._id,// or Userdata if error if error come
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(
            new ApiResponse(200, {}, "user loggedout!!")
        )
})

const refreshaccessToken = asynHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!refreshaccessToken) {
        throw new ApiHandleError(401, "Refresh token is required")
    }

    const decodedToken = jwt.verify(
        incomingrefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const User = await user.findById(decodedToken?._id);

    if(!User){
        throw new ApiHandleError(401, "Invalid refreshToken")
    }

    if(incomingrefreshToken!==User?.refreshToken){
        throw new ApiHandleError(401, "Invalid mismath Token");
    }


})

export {
    registerUser,
    loginUser,
    logoutUser
}