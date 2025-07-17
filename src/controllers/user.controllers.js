import { asynHandler } from "../utils/asynHandler.js";
import { ApiHandleError } from "../utils/apierrorhandle.js";
import { user } from "../models/user.model.js"
import { uploadoncloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";


const genrateAcessandRefreshToken = async (userId) => 
{
    try{
        const genuser = await user.findById(userId)
        const accessToken = genuser.genrateAccessToken()
        const RefreshToken = genuser.genrateRefreshToken()

        genuser.RefreshToken = RefreshToken
        genuser.save({validateBeforeSave: false})

        return {accessToken, RefreshToken}

    }catch(error){
        throw ApiHandleError("Some thing went wrong wile genrating refresh and access token")
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
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
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

    
    res.status(200).json({
        success: true,
        message: "ok"
    })


})

const loginUser = asynHandler(async (req, res) => {

    // steps what we have to do
    // req.body take user data
    // username or email
    // find the user
    // check for password
    // refresh token and access token;
    // send cookies

    const {username, email, password} = req.body
    console.log(email)

    if(!username && !email){
        throw new ApiHandleError(400,"username and password is required")
    }

    const Userdata = await user.findOne({
        $or: [{email},{username}]
    })

    if(!Userdata){
        throw new ApiHandleError(400,"Need atleast username or password no user exist")
    }

    const ispasswordvalidate = Userdata.isCorrectPassword(password)

    if(!ispasswordvalidate){
        throw new ApiHandleError(401,"in valid password");
    }

    const {accessToken,RefreshToken} = await genrateAcessandRefreshToken(Userdata._id)

    const loggedInUser = await user.findById(Userdata._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("acessToken", accessToken , option)
    .cookie("refreshToken", RefreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, RefreshToken
            },
            "user LoggedIn successfully"
        )
    )
})

const logoutUser = asynHandler(async (req,res) => {
    await user.findByIdAndUpdate(
        req.storeuser._id,// or Userdata if error if error come
        {
            $set:{
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
    .clearCookie("acessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200, {} ,"user loggedout!!")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser
}