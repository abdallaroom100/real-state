import express from "express"
import { addCompound, deleteCompound, getAllCompounds, updateCompound } from "../controllers/compound.controller.js"

const router = express.Router()
// compound/
router.get("/",getAllCompounds)
router.post("/add",addCompound)
router.patch("/update/:id",updateCompound)
router.delete("/delete/:id",deleteCompound)

export default router