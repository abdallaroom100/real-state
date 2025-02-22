import express from "express"
import { addApartment, deleteApartment, getAllApartments, getAllCompoundApartment, getCurrentApartment, updateApartment } from "../controllers/apartment.controller.js"
import { protectRoute } from "../utils/protectedRoute.js"
import multer from "multer"
import fs from "fs"
const router = express.Router()

const upload = multer({ dest: 'uploads/' }); // مجلد حفظ الملفات

// export const clearTempFiles = (req, res, next) => {
//     if (req.files) {
//       const allFiles = [
//         ...(req.files.mainImage || []),
//         ...(req.files.video || []),
//         ...(req.files.images || []),
//       ];
  
//       allFiles.forEach((file) => {
//         if (fs.existsSync(file.path)) {
//           fs.unlinkSync(file.path);
//         }
//       });
//     }
  
//     next();
//   };
// Middleware لاستقبال الملفات
const multiUpload = upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ]);

router.get("/",getAllApartments)
router.get("/:compoundId",getAllCompoundApartment)
router.get("/find/:id",protectRoute,getCurrentApartment)
router.post("/add/:compoundId",protectRoute,multiUpload,addApartment)
router.patch("/update/:apartmentId",protectRoute,multiUpload,updateApartment)
router.delete("/delete/:apartmentId",protectRoute,deleteApartment)

export default router 