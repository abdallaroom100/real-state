import express from "express"
import { addApartment, deleteApartment, getAllApartments, updateApartment } from "../controllers/apartment.controller.js"

const router = express.Router()


router.get("/:compoundId",getAllApartments)
router.post("/add/:compoundId",addApartment)
router.patch("/update/:compoundId",updateApartment)
router.delete("/delete/:compoundId",deleteApartment)

export default router