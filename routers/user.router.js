import express from "express"
import { protectRoute } from "../utils/protectedRoute.js"
import { deleteUser, getCurrentUser, loginUser, logOut, signUpUser, updateUser } from "../controllers/user.controller.js"


const router = express.Router()


router.get("/me",protectRoute,getCurrentUser)
router.post("/signup",signUpUser)
router.post("/login",loginUser)
router.patch("/update/:userId",updateUser)
router.delete("/delete/:userId",deleteUser)
router.post("/logout",logOut)

export default router