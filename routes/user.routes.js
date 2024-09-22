import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { registerUser, loginUser, logoutUser ,refreshAccessToken,deleteAccount} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
// import { likeOrDislike } from "../controllers/post.controller.js";

const router = Router()

router.route("/register").post(upload.fields(
    [
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]
),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/delete-account").delete(verifyJWT, deleteAccount)

export default router 