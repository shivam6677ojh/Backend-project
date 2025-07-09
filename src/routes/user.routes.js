
import { Router } from "express"
import { registerUser } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { ApiHandleError } from "../utils/apierrorhandle.js"


const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name : "avtar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]) // this is a place we use multer middle ware

    ,registerUser)


export {router as userRouter}