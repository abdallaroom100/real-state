import express from "express"
import { addCompound, deleteCompound, getAllCompounds, getCurrentCompound, testUploadFiles, updateCompound } from "../controllers/compound.controller.js"
import { protectRoute } from "../utils/protectedRoute.js"
import multer from "multer"
import fs from "fs"

const upload = multer({ dest: 'uploads/' ,
  limits: { fileSize: 1024 * 1024 * 1024 },
}); // مجلد حفظ الملفات

export const clearTempFiles = (req, res, next) => {
    if (req.files) {
      const allFiles = [
        ...(req.files.mainImage || []),
        ...(req.files.video || []),
        ...(req.files.images || []),
      ];
  
      allFiles.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
  
    next();
  };
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
router.patch("/update/:id",protectRoute,multiUpload,updateCompound)
router.post("/add",protectRoute,multiUpload,addCompound)
// router.post("/upload",protectRoute,multiUpload,testUploadFiles)
router.delete("/delete/:id",protectRoute,deleteCompound)
 
export default router     