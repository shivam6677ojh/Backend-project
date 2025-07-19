
import { Router } from "express"
import { loginUser, registerUser, logoutUser , refreshaccessToken} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { ApiHandleError } from "../utils/apierrorhandle.js"
import { verifyJwt } from "../middlewares/auth.middlewares.js"


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

    ,registerUser
)

router.route('/login').post(loginUser)

// secured routes

router.route('/logout').post(verifyJwt, logoutUser);
router.route('/refresh-token').post(refreshaccessToken);




export {router as userRouter}