import express from "express"
import { addApartment, deleteApartment, getAllApartments, getCurrentApartment, updateApartment } from "../controllers/apartment.controller.js"

const router = express.Router()


router.get("/:compoundId",getAllApartments)
router.get("/find/:id",getCurrentApartment)
router.post("/add/:compoundId",addApartment)
router.patch("/update/:compoundId",updateApartment)
router.delete("/delete/:apartmentId",deleteApartment)

export default router 