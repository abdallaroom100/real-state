import express from "express"
import { protectRoute } from "../utils/protectedRoute.js"
import { getCurrentUser, loginUser, logOut, signUpUser } from "../controllers/user.controller.js"


const router = express.Router()


router.get("/me",protectRoute,getCurrentUser)
router.post("/signup",signUpUser)
router.post("/login",loginUser)
router.patch("/update/:userId",logOut)
router.delete("/delete/:userId",logOut)
router.post("/logout",logOut)

export default router