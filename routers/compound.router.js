import express from "express"
import { addCompound, deleteCompound, getAllCompounds, getCurrentCompound, testUploadFiles, updateCompound } from "../controllers/compound.controller.js"
import { protectRoute } from "../utils/protectedRoute.js"
import multer from "multer"


const upload = multer({ dest: 'uploads/' }); // مجلد حفظ الملفات

// Middleware لاستقبال الملفات
const multiUpload = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]);
  
const router = express.Router()
// compound/
router.get("/",getAllCompounds)
router.get("/find/:id",getCurrentCompound)
// router.post("/add",protectRoute,addCompound)
// router.patch("/update/:id",protectRoute,updateCompound)
router.patch("/update/:id",multiUpload,updateCompound)
router.post("/add",multiUpload,addCompound)
router.post("/upload",multiUpload,testUploadFiles)
router.delete("/delete/:id",protectRoute,deleteCompound)
 
export default router     