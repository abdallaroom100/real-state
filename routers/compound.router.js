import express from "express"
import { addCompound, deleteCompound, getAllCompounds, getCurrentCompound, updateCompound } from "../controllers/compound.controller.js"

const router = express.Router()
// compound/
router.get("/",getAllCompounds)
router.get("/find/:id",getCurrentCompound)
router.post("/add",addCompound)
router.patch("/update/:id",updateCompound)
router.delete("/delete/:id",deleteCompound)

export default router