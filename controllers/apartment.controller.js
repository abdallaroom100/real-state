import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Apartment } from "../models/Compound.schema.js";

export const getAllCompoundApartment = async (req, res) => {
  try {
    const { compoundId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(compoundId)) {
      return res.status(401).json({ error: "invalid id" });
    }
    const apartments = await Apartment.find({ compound: compoundId });
    console.log(apartments);
    res.status(200).json(apartments);
  } catch (error) {
    console.log("error in get all compound apartments function");
    console.log(error.message);
  } 
};


export const getAllApartments = async(req,res)=>{
  try {
    const apartments = await Apartment.find()
   
    if(!apartments) {
      return res.status(400).json({error:"there is not apartments "})
    }

  // await Apartment.updateMany({},{
  //   $set:{video:""}
  // },{new:true})
    res.status(200).json(apartments)
  } catch (error) {
    console.log("error in get all apartments function");
    console.log(error.message);
  }
}

export const getCurrentApartment = async (req,res)=>{
   const {id} = req.params
  try {
    if(!mongoose.Types.ObjectId.isValid(id)){
      return req.status(400).json({error:"invalid apartment id"})
    }
    const apartment = await Apartment.findById(id)
    if(!apartment){
      return res.status(400).json("apartment not found")
    }
    return res.status(200).json(apartment)
  } catch (error) {
    console.log(`error in get current apartment function`)
    console.log(error.message)
  }
}


export const addApartment = async (req, res) => {
  try {
    const { compoundId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(compoundId)) {
      return res.status(401).json({ error: "Invalid compound ID" });
    }

    const { space, floor, bathrooms, description, status, rooms, price, identity, model } = req.body;

    if (!space || !floor || !status || !bathrooms || !description || !rooms || !identity || !price) {
      return res.status(401).json({ error: "Please fill all fields" });
    }

    if (!["sold", "available", "soon"].includes(status)) {
      return res.status(400).json({ error: "Please select a valid status: sold, available, soon" });
    }

    // **1. Generate IDs with file extensions if files exist**
    const videoId = req.files?.video
      ? `${uuidv4()}${path.extname(req.files.video[0].originalname)}`
      : null;

    const mainImageId = req.files?.mainImage
      ? `${uuidv4()}${path.extname(req.files.mainImage[0].originalname)}`
      : null;

    const imagesIds = req.files?.images
      ? req.files.images.map((file) => `${uuidv4()}${path.extname(file.originalname)}`)
      : [];

    // **2. Create the apartment in the database**
    const newApartment = await Apartment.create({
      mainImage: mainImageId,
      images: imagesIds,
      video: videoId,
       model: model?model:"",
      space,
      floor,
      status,
      bathrooms,
      price,
      description,
      rooms,
      identity,
      compound: compoundId,
    });
      newApartment.mainImage = req.files?.mainImage
      ? `uploads/${compoundId}/${newApartment._id}/images/${mainImageId}`
      : null;
      newApartment.video = req.files?.video
      ? `uploads/${compoundId}/${newApartment._id}/videos/${videoId}`
      : null;
      newApartment.images = newApartment.images.map(image=>{
        return `uploads/${compoundId}/${newApartment._id}/images/${image}`
      })
      await newApartment.save()
    // **3. إنشاء المجلدات إذا كان هناك ملفات**
    const compoundFolder = path.join("uploads", compoundId);
    const apartmentFolder = path.join(compoundFolder, newApartment._id.toString());

    if (!fs.existsSync(compoundFolder)) {
      fs.mkdirSync(compoundFolder, { recursive: true });
    }
    if (!fs.existsSync(apartmentFolder)) {
      fs.mkdirSync(apartmentFolder, { recursive: true });
    }

    // **4. نقل الملفات مع الامتداد**
    if (req.files?.mainImage) {
      const imagesFolder = path.join(apartmentFolder, "images");
      if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder);
      }
      const mainImagePath = path.join(imagesFolder, mainImageId);
      fs.renameSync(req.files.mainImage[0].path, mainImagePath);
    }

    if (req.files?.video) {
      const videoFolder = path.join(apartmentFolder, "video");
      if (!fs.existsSync(videoFolder)) {
        fs.mkdirSync(videoFolder);
      }
      const videoPath = path.join(videoFolder, videoId);
      fs.renameSync(req.files.video[0].path, videoPath);
    }

    if (req.files?.images) {
      const imagesFolder = path.join(apartmentFolder, "images");
      if (!fs.existsSync(imagesFolder)) {
        fs.mkdirSync(imagesFolder);
      }

      req.files.images.forEach((file, index) => {
        const imagePath = path.join(imagesFolder, imagesIds[index]);
        fs.renameSync(file.path, imagePath);
      });
    }

    // **5. استرجاع البيانات مع الصيغ**
    res.status(200).json({
      message: "Apartment created successfully",
      apartment: newApartment,
      videoId,
      mainImageId,
      imagesIds,
      model: model?model:""
    });
  } catch (error) {
    console.error("Error in addApartment function:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// export const addApartment = async (req, res) => {
//   try {
//     const { compoundId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(compoundId)) {
//       return res.status(401).json({ error: "invalid id" });
//     }
//     const {
//       mainImage,
//       images,
//       video,
//       space,
//       floor,
//       bathrooms,
//       description,
//       status,
//       rooms,
//       price,
//       identity
//     } = req.body;

//     if (
//       !mainImage ||
//       !space ||
//       !floor ||
//       !status ||
//       !bathrooms ||
//       !description ||
//       !rooms || !identity || !price
//     ) {
//       return res.status(401).json({ error: "please fill all fields" });
//     }

//     if (status !== "sold" && status !== "available" && status !== "soon") {
//       return res
//         .status(400)
//         .json({ error: "please select what is available in status" });
//     }
//     const newApartment = await Apartment.create({
//       mainImage,
//       images,
//       video,
//       space,
//       floor,
//       status,
//       bathrooms,
//       price,
//       description,
//       rooms,
//       identity,
//       compound: compoundId,
//     });

//     res.status(200).json(newApartment);
//   } catch (error) {
//     console.log("error in add apartment function");
//     console.log(error.message);
//   }
// };

// export const addApartment = async (req, res) => {
//   try {
//     const { compoundId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(compoundId)) {
//       return res.status(401).json({ error: "Invalid compound ID" });
//     }

//     const { space, floor, bathrooms, description, status, rooms, price, identity } = req.body;

//     if (!space || !floor || !status || !bathrooms || !description || !rooms || !identity || !price) {
//       return res.status(401).json({ error: "Please fill all fields" });
//     }

//     if (!["sold", "available", "soon"].includes(status)) {
//       return res.status(400).json({ error: "Please select a valid status: sold, available, soon" });
//     }

//     // 1. Generate IDs only if files exist
//     const videoId = req.files?.video ? uuidv4() : null;
//     const mainImageId = req.files?.mainImage ? uuidv4() : null;

//     // لكل صورة في الـ array نعمل ID خاص بيها
//     const imagesIds = req.files?.images
//       ? req.files.images.map(() => uuidv4())
//       : [];

//     // 2. Create the apartment in the database
//     const newApartment = await Apartment.create({
//       mainImage: mainImageId,
//       images: imagesIds,
//       video: videoId,
//       space,
//       floor,
//       status,
//       bathrooms,
//       price,
//       description,
//       rooms,
//       identity,
//       compound: compoundId,
//     });

//     // 3. إنشاء المجلدات إذا كان هناك ملفات
//     const compoundFolder = path.join("uploads", compoundId);
//     const apartmentFolder = path.join(compoundFolder, newApartment._id.toString());

//     if (!fs.existsSync(compoundFolder)) {
//       fs.mkdirSync(compoundFolder, { recursive: true });
//     }
//     if (!fs.existsSync(apartmentFolder)) {
//       fs.mkdirSync(apartmentFolder, { recursive: true });
//     }

//     // 4. نقل الملفات إذا وجدت
//     if (req.files?.mainImage) {
//       const imagesFolder = path.join(apartmentFolder, "images");
//       if (!fs.existsSync(imagesFolder)) {
//         fs.mkdirSync(imagesFolder);
//       }
//       const mainImagePath = path.join(imagesFolder, `${mainImageId}-${req.files.mainImage[0].originalname}`);
//       fs.renameSync(req.files.mainImage[0].path, mainImagePath);
//     }

//     if (req.files?.video) {
//       const videoFolder = path.join(apartmentFolder, "video");
//       if (!fs.existsSync(videoFolder)) {
//         fs.mkdirSync(videoFolder);
//       }
//       const videoPath = path.join(videoFolder, `${videoId}-${req.files.video[0].originalname}`);
//       fs.renameSync(req.files.video[0].path, videoPath);
//     }

//     if (req.files?.images) {
//       const imagesFolder = path.join(apartmentFolder, "images");
//       if (!fs.existsSync(imagesFolder)) {
//         fs.mkdirSync(imagesFolder);
//       }

//       // حفظ كل صورة مع الـ ID الخاص بيها
//       req.files.images.forEach((file, index) => {
//         const imageId = imagesIds[index];
//         const imagePath = path.join(imagesFolder, `${imageId}-${file.originalname}`);
//         fs.renameSync(file.path, imagePath);
//       });
//     }

//     // 5. استرجاع البيانات
//     res.status(200).json({
//       message: "Apartment created successfully",
//       apartment: newApartment,
//       videoId,
//       mainImageId,
//       imagesIds,
//     });
//   } catch (error) {
//     console.error("Error in addApartment function:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export const updateApartment = async (req, res) => {
//   const { compoundId } = req.params;
//   console.log(compoundId)
//   try {
//     if (!mongoose.Types.ObjectId.isValid(compoundId)) {
//       return res.status(400).json({ error: "invalid id" });
//     }
//     const {
//       mainImage,
//       images,
//       video,
//       space,
//       floor,
//       bathrooms,
//       description,
//       status,
//       price,
//       rooms,
//       identity,
//     } = req.body;

//     if (
//       !mainImage &&
//       !space &&
//       !floor &&
//       !status &&
//       !bathrooms &&
//       !description &&
//       !rooms && !identity && ! price
//     ) {
//       return res.status(401).json({ error: "قم بملئ البيانات الاساسية" });
//     }
//     if (status !== "sold" && status !== "available" && status !== "soon") {
//       return res
//         .status(400)
//         .json({ error: "please select what is available in status" });
//     }
//     const updatedApartment = await Apartment.findByIdAndUpdate(
//       compoundId,
//       {
//         mainImage,
//         images,
//         video,
//         space,
//         floor,
//         bathrooms,
//         description,
//         status,
//         price,
//         rooms,
//         identity
//       },
//       {
//         new: true,
//       }
//     );
//     if (!updatedApartment) {
//       return res.status(401).json({ error: "apartment not found" });
//     }
//     res.status(200).json(updatedApartment);
//   } catch (error) {
//     console.log("error in update apartment function");
//     console.log(error.message);
//   }
// };




// const moveFile = (oldPath, newPath) => {
//   if (fs.existsSync(oldPath)) {
//     fs.renameSync(oldPath, newPath);
//     return newPath;
//   }
//   console.error(`File not found: ${oldPath}`);
//   return null;
// };

// // دالة لحذف الملفات
// const deleteFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
//   }
// };

// export const updateApartment = async (req, res) => {
//   const { apartmentId } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
//       return res.status(400).json({ error: "Invalid ID" });
//     }

//     const {
//       images: keptImageIds = [], // الـ IDs الخاصة بالصور التي تريد الاحتفاظ بها
//       space,
//       floor,
//       bathrooms,
//       description,
//       status,
//       price,
//       rooms,
//       identity,
//     } = req.body;

//     const mainImageFile = req.files?.mainImage?.[0];
//     const videoFile = req.files?.video?.[0];
//     const newImages = req.files?.images || [];

//     if (!space && !floor && !status && !bathrooms && !description && !rooms && !identity && !price) {
//       return res.status(401).json({ error: "قم بملئ البيانات الاساسية" });
//     }

//     if (!["sold", "available", "soon"].includes(status)) {
//       return res.status(400).json({ error: "Please select what is available in status" });
//     }

//     const apartment = await Apartment.findById(apartmentId);
//     if (!apartment) {
//       return res.status(404).json({ error: "Apartment not found" });
//     }

//     const apartmentFolder = path.join("uploads", apartmentId);
//     const imagesFolder = path.join(apartmentFolder, "images");
//     const videoFolder = path.join(apartmentFolder, "video");

//     // إنشاء المجلدات إذا لم تكن موجودة
//     [apartmentFolder, imagesFolder, videoFolder].forEach((folder) => {
//       if (!fs.existsSync(folder)) {
//         fs.mkdirSync(folder, { recursive: true });
//       }
//     });

//     // **1. تحديث Main Image**
//     if (mainImageFile) {
//       if (apartment.mainImage) deleteFile(apartment.mainImage);
//       const mainImagePath = path.join(imagesFolder, mainImageFile.originalname);
//       apartment.mainImage = moveFile(mainImageFile.path, mainImagePath);
//     }

//     // **2. حذف الصور الغير موجودة في الـ IDs المرسلة**
//     apartment.images.forEach((imgPath) => {
//       const imageId = path.basename(imgPath, path.extname(imgPath));
//       if (!keptImageIds.includes(imageId)) {
//         deleteFile(imgPath); // حذف الصورة إذا لم يكن ID الخاص بها موجودًا
//       }
//     });

//     // **3. إضافة الصور الجديدة**
//     const newImagePaths = [];
//     newImages.forEach((image) => {
//       const imageId = `${Date.now()}-${image.originalname}`;
//       const imagePath = path.join(imagesFolder, imageId);
//       moveFile(image.path, imagePath);
//       newImagePaths.push(imagePath);
//     });

//     // **4. تحديث الفيديو**
//     if (videoFile) {
//       if (apartment.video) deleteFile(apartment.video);
//       const videoPath = path.join(videoFolder, videoFile.originalname);
//       apartment.video = moveFile(videoFile.path, videoPath);
//     }

//     // **5. تحديث قائمة الصور**
//     apartment.images = [
//       ...apartment.images.filter((imgPath) => {
//         const imageId = path.basename(imgPath, path.extname(imgPath));
//         return keptImageIds.includes(imageId);
//       }),
//       ...newImagePaths,
//     ];

//     // **6. تحديث البيانات الأخرى**
//     Object.assign(apartment, {
//       space,
//       floor,
//       bathrooms,
//       description,
//       status,
//       price,
//       rooms,
//       identity,
//     });

//     await apartment.save();

//     res.status(200).json({
//       message: "Apartment updated successfully",
//       apartment,
//       newImageIds: newImagePaths.map((path) => path && path.split("/").pop()),
//     });
//   } catch (error) {
//     console.error("Error in updateApartment function:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const moveFile = (oldPath, newPath) => {
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    return newPath.replace(/\\/g, "/");
  }
  console.error(`File not found: ${oldPath}`);
  return null;
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const updateApartment = async (req, res) => {
  const { apartmentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const {
      images: keptImageUrls = [],
      space,
      floor,
      bathrooms,
      description,
      status,
      price,
      rooms,
      identity,
      deleteVideo = false,
      model
    } = req.body;

    const mainImageFile = req.files?.mainImage?.[0];
    const videoFile = req.files?.video?.[0];
    const newImages = req.files?.images || [];

    if (!space && !floor && !status && !bathrooms && !description && !rooms && !identity && !price) {
      return res.status(401).json({ error: "قم بملئ البيانات الاساسية" });
    }

    if (!["sold", "available", "soon"].includes(status)) {
      return res.status(400).json({ error: "Please select what is available in status" });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Apartment not found" });
    }

    const compoundId = apartment.compound;
    if (!compoundId) {
      return res.status(400).json({ error: "Compound ID not found for this apartment" });
    }

    const basePath = path.join("uploads", compoundId.toString(), apartmentId);
    const imagesFolder = path.join(basePath, "images");
    const videoFolder = path.join(basePath, "videos");

    [basePath, imagesFolder, videoFolder].forEach((folder) => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });

    if (!req.body.video) {
      fs.readdirSync(videoFolder).forEach((file) => {
        deleteFile(path.join(videoFolder, file));
      });
      apartment.video = null;
    }

    if (mainImageFile) {
      if (apartment.mainImage) deleteFile(path.join(imagesFolder, apartment.mainImage));
      const mainImageId = uuidv4();
      const mainImagePath = path.join(imagesFolder, `${mainImageId}${path.extname(mainImageFile.originalname)}`).replace(/\\/g, "/");
      apartment.mainImage = moveFile(mainImageFile.path, mainImagePath);
    }

    // تعديل: تحويل keptImageUrls لمسارات كاملة لو كانت أسماء ملفات فقط
    const keptImagePaths = keptImageUrls.map((url) => {
      const fileName = path.basename(url); // استخراج اسم الملف من الـ URL
      return path.join(imagesFolder, fileName).replace(/\\/g, "/"); // المسار الكامل
    });

    // حذف الصور القديمة اللي مش موجودة في keptImageUrls
    apartment.images.forEach((imgPath) => {
      const imgName = path.basename(imgPath);
      if (!keptImageUrls.includes(imgName) && !keptImageUrls.includes(imgPath)) {
        deleteFile(path.join(imagesFolder, imgName));
      }
    });

    // إضافة الصور الجديدة مع المسارات الكاملة
    const newImagePaths = [];
    newImages.forEach((image) => {
      const imageId = uuidv4();
      const imagePath = path.join(imagesFolder, `${imageId}${path.extname(image.originalname)}`).replace(/\\/g, "/");
      moveFile(image.path, imagePath);
      newImagePaths.push(imagePath); // إضافة المسار الكامل
    });

    if (videoFile) {
      fs.readdirSync(videoFolder).forEach((file) => {
        deleteFile(path.join(videoFolder, file));
      });
      const videoId = uuidv4();
      const videoPath = path.join(videoFolder, `${videoId}${path.extname(videoFile.originalname)}`).replace(/\\/g, "/");
      apartment.video = moveFile(videoFile.path, videoPath);
    }

    if (deleteVideo && apartment.video) {
      deleteFile(path.join(videoFolder, apartment.video));
      apartment.video = null;
    }

    // دمج المسارات القديمة المحتفظ بها مع الجديدة
    apartment.images = [...keptImagePaths, ...newImagePaths];

    Object.assign(apartment, {
      space,
      floor,
      bathrooms,
      description,
      status,
      price,
      rooms,
      identity,
       model: model?model:""
    });

    await apartment.save();

    res.status(200).json({
      message: "Apartment updated successfully",
      apartment,
      newImagePaths,
    });
  } catch (error) {
    console.error("Error in updateApartment function:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const deleteApartment = async (req,res)=>{
//     const {apartmentId} = req.params
     
//     try {
//         if(!mongoose.Types.ObjectId.isValid(apartmentId)){
//             return res.status(400).json({error:"invalid id"})
//         }
//         const deletedCompound = await Apartment.findByIdAndDelete(apartmentId,{
//             new:true
//         })
//         if(!deletedCompound){
//             return res.status(401).json({error:"apartment not found"})
//         }
//         res.status(200).json(deletedCompound)
//     } catch (error) {
//         console.log("error in delete apartment function")
//         console.log(error.message)
//     }
// }

export const deleteApartment = async (req, res) => {
  const { apartmentId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const apartment = await Apartment.findById(apartmentId);
    if (!apartment) {
      return res.status(404).json({ error: "Apartment not found" });
    }

    const compoundId = apartment.compound;
    if (!compoundId) {
      return res.status(400).json({ error: "Compound ID not found for this apartment" });
    }

    const apartmentFolder = path.join("uploads", compoundId.toString(), apartmentId);

    const deleteFolderRecursive = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
          const currentPath = path.join(folderPath, file);
          if (fs.lstatSync(currentPath).isDirectory()) {
            deleteFolderRecursive(currentPath);
          } else {
            fs.unlinkSync(currentPath);
          }
        });
        fs.rmdirSync(folderPath);
      }
    };

    deleteFolderRecursive(apartmentFolder);

    await Apartment.findByIdAndDelete(apartmentId);

    res.status(200).json({ message: "Apartment deleted successfully" });
  } catch (error) {
    console.error("Error in deleteApartment function:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
