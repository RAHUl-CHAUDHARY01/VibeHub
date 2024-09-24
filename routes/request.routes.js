import { Router } from "express";
import { sendFollowRequest } from "../controllers/follow.controller.js";
import { respondToFollowRequest } from "../controllers/acceptFollow.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()




// Send follow request


router.route('/follow-request/:id').post(verifyJWT, sendFollowRequest);

// Respond to follow request (accept or reject)
router.route('/follow-request-respond').post( verifyJWT, respondToFollowRequest);

export default router 


// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin git@github.com:Akshat161/VibeHub.git
// git push -u origin main