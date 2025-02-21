import mongoose from "mongoose";
import { Compound } from "../models/Compound.schema.js";
import path from 'path';
import fs from "fs"
import { v4 as uuidv4 } from 'uuid';
export const getAllCompounds = async (req, res) => {
  try {
    const compounds = await Compound.find();

    res.status(200).json(compounds);
  } catch (error) {
    console.log("error in get all compound function");
    console.log(error.message);
  }
};
 
export const getCurrentCompound = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "not valid compound id" });
    }
    const compound = await Compound.findById(id);
    if (!compound)
      return res.status(401).json({ error: "the compound not found" });
    return res.status(200).json(compound);
  } catch (error) {
    console.log(`error in get curernt compound function`);
    console.log(error.message);
  }
};

// export const addCompound = async (req, res) => {
//   try {
//     const {
//       mainImage,
//       images,
//       title,
//       location,
//       status,
//       video,
//       description,
//       address,
//       map,
//       pdf,
//     } = req.body;

//     if (
//       !mainImage ||
//       !title ||
//       !location ||
//       !status ||
//       !description ||
//       !address
//     ) {
//       return res.status(401).json({ error: "please fill all fields" });
//     }
//     if (status !== "sold" && status !== "available" && status !== "soon") {
//       return res
//         .status(400)
//         .json({ error: "please select what is available in status" });
//     }
//     const newCompound = await Compound.create({
//       mainImage,
//       images,
//       title,
//       location,
//       status,
//       video,
//       address,
//       description,
//       map,
//       pdf,
//     });

//     res.status(200).json(newCompound);
//   } catch (error) {
//     console.log("error in add compound function");
//     console.log(error.message);
//   }
// };
export const addCompound = async (req, res) => {
  try {
    const { title, location, status, description, address, map } = req.body;

    if (!title || !location || !status || !description || !address) {
      return res.status(401).json({ error: "Please fill all fields" });
    }

    if (!['sold', 'available', 'soon'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // **تخزين الـ IDs المؤقتة**
    let mainImageId = null;
    let imageIds = [];
    let videoId = null;
    let pdfId = null;

    // **رفع الملفات وتخزين الـ IDs**
    if (req.files?.mainImage) {
      const mainImage = req.files.mainImage[0];
      const ext = path.extname(mainImage.originalname);
      mainImageId = `${uuidv4()}${ext}`;
    }

    if (req.files?.images) {
      imageIds = req.files.images.map((image) => {
        const ext = path.extname(image.originalname);
        return `${uuidv4()}${ext}`;
      });
    }

    if (req.files?.video) {
      const video = req.files.video[0];
      const ext = path.extname(video.originalname);
      videoId = `${uuidv4()}${ext}`;
    }

    if (req.files?.pdf) {
      const pdf = req.files.pdf[0];
      const ext = path.extname(pdf.originalname);
      pdfId = `${uuidv4()}${ext}`;
    }

    // **إنشاء الـ Compound بعد تجهيز الـ IDs**
    const newCompound = await Compound.create({
      title,
      location,
      status,
      address,
      description,
      map,
      mainImage: mainImageId,
      images: imageIds,
      video: videoId,
      pdf: pdfId,
    });

    const compoundId = newCompound.id;
    const compoundFolder = path.join('uploads', compoundId.toString());
    const videoFolder = path.join(compoundFolder, 'videos');
    const imagesFolder = path.join(compoundFolder, 'images');
    const pdfFolder = path.join(compoundFolder, 'pdfs');

    [compoundFolder, videoFolder, imagesFolder, pdfFolder].forEach(folder => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });

    // **نقل الملفات بعد إنشاء الـ Compound**
    if (mainImageId && req.files?.mainImage) {
      const mainImagePath = path.join(imagesFolder, mainImageId);
      fs.renameSync(req.files.mainImage[0].path, mainImagePath);
    }

    if (imageIds.length > 0 && req.files?.images) {
      req.files.images.forEach((image, index) => {
        const imagePath = path.join(imagesFolder, imageIds[index]);
        fs.renameSync(image.path, imagePath);
      });
    }

    if (videoId && req.files?.video) {
      const videoPath = path.join(videoFolder, videoId);
      fs.renameSync(req.files.video[0].path, videoPath);
    }

    if (pdfId && req.files?.pdf) {
      const pdfPath = path.join(pdfFolder, pdfId);
      fs.renameSync(req.files.pdf[0].path, pdfPath);
    }

    res.status(200).json({
      message: 'Compound created successfully',
      compound: newCompound,
      mainImage: mainImageId,
      images: imageIds,
      video: videoId,
      pdf: pdfId,
    });

  } catch (error) {
    console.error("Error in addCompound function:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const moveFile = (file, folder) => {
  const oldPath = file.path;
  const newPath = path.join(`uploads/${folder}`, file.originalname);

  fs.rename(oldPath, newPath, (err) => {
      if (err) {
          console.error(`❌ Error moving ${file.originalname}:`, err);
      } else {
          console.log(`✅ Moved ${file.originalname} to ${folder}`);
      }
  });

  return newPath; // بنرجع المسار الجديد
};

export const testUploadFiles =  async (req,res)=>{
  try {
    const { name, email, age } = req.body;
    const images = req.files['images'] || [];
    const video = req.files['video'] ? req.files['video'][0] : null;
    const pdf = req.files['pdf'] ? req.files['pdf'][0] : null;

    // نقل الصور
    const imagePaths = images.map((image) => moveFile(image, 'images'));

    // نقل الفيديو
    const videoPath = video ? moveFile(video, 'videos') : null;

    // نقل ملف PDF
    const pdfPath = pdf ? moveFile(pdf, 'pdfs') : null;

    res.json({
        message: 'Files uploaded and organized successfully!',
        userData: { name, email, age },
        files: { images: imagePaths, video: videoPath, pdf: pdfPath }
    });
  } catch (error) {
    console.log(error)
  }
}

// export const updateCompound = async (req, res) => {
//   const { id } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "invalid id" });
//     }
//     const {
//       title,
//       mainImage,
//       location,
//       images,
//       status,
//       video,
//       description,
//       address,
//       map,
      
//       pdf,
//     } = req.body;
//     if (
//       mainImage &&
//       !title &&
//       !location &&
//       !status &&
//       !description &&
//       !address
//     ) {
//       return res
//         .status(401)
//         .json({ error: "fill all required fields for updating" });
//     }
//     if (status !== "sold" && status !== "available" && status !== "soon") {
//       return res
//         .status(400)
//         .json({ error: "please select what is available in status" });
//     }
//     const updatedCompound = await Compound.findByIdAndUpdate(
//       id,
//       {
//         title,
//         location,
//         mainImage,
//         video,
//         images,
//         status,
//         description,
//         address,
//         map,
//         pdf,
//       },
//       {
//         new: true,
//       }
//     );
//     if (!updatedCompound) {
//       return res.status(401).json({ error: "compound not found" });
//     }
//     res.status(200).json(updatedCompound);
//   } catch (error) {
//     console.log("error in update compound function");
//     console.log(error.message);
//   }
// };

// export const updateCompound = async (req, res) => {
//   const { id } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid ID" });
//     }

//     const { title, location, status, description, address, map, images: imageIds, video: videoId, pdf: pdfId } = req.body;

//     if (!title || !location || !status || !description || !address) {
//       return res.status(401).json({ error: "Fill all required fields for updating" });
//     }

//     if (!['sold', 'available', 'soon'].includes(status)) {
//       return res.status(400).json({ error: "Please select a valid status" });
//     }

//     const compound = await Compound.findById(id);
//     if (!compound) {
//       return res.status(404).json({ error: "Compound not found" });
//     }

//     const compoundFolder = path.join('uploads', id);
//     const videoFolder = path.join(compoundFolder, 'videos');
//     const imagesFolder = path.join(compoundFolder, 'images');
//     const pdfFolder = path.join(compoundFolder, 'pdfs');

//     const deleteFile = (folder, filename) => {
//       const filePath = path.join(folder, filename);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     };

//     // **تحديث الصور الجديدة أو الموجودة**
//     let newImageIds = imageIds ? imageIds.split(',') : [];
//     if (req.files?.images) {
//       req.files.images.forEach((image) => {
//         const imageId = `${uuidv4()}${path.extname(image.originalname)}`;
//         newImageIds.push(imageId);
//         fs.renameSync(image.path, path.join(imagesFolder, imageId));
//       });

//       // **حذف الصور اللي مش موجودة**
//       compound.images.forEach((oldId) => {
//         if (!newImageIds.includes(oldId)) {
//           deleteFile(imagesFolder, oldId);
//         }
//       });
//     }

//     // **تحديث الفيديو**
//     let newVideoId = videoId;
//     if (req.files?.video) {
//       if (compound.video) {
//         deleteFile(videoFolder, compound.video);
//       }
//       newVideoId = `${uuidv4()}${path.extname(req.files.video[0].originalname)}`;
//       fs.renameSync(req.files.video[0].path, path.join(videoFolder, newVideoId));
//     }

//     // **تحديث الـ PDF**
//     let newPdfId = pdfId;
//     if (req.files?.pdf) {
//       if (compound.pdf) {
//         deleteFile(pdfFolder, compound.pdf);
//       }
//       newPdfId = `${uuidv4()}${path.extname(req.files.pdf[0].originalname)}`;
//       fs.renameSync(req.files.pdf[0].path, path.join(pdfFolder, newPdfId));
//     }

//     // **تحديث الـ Database**
//     const updatedCompound = await Compound.findByIdAndUpdate(
//       id,
//       {
//         title,
//         location,
//         images: newImageIds,
//         video: newVideoId,
//         status,
//         description,
//         mainImage: newMainImage, 
//         address,
//         map,
//         pdf: newPdfId, 
//       },
//       { new: true } 
//     );

//     res.status(200).json({ message: "Compound updated successfully", compound: updatedCompound });
//   } catch (error) {
//     console.error("Error in updateCompound function:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
export const updateCompound = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { title, location, status, description, address, map, images: imageIds, video: videoId, pdf: pdfId } = req.body;

    if (!title || !location || !status || !description || !address) {
      return res.status(401).json({ error: "Fill all required fields for updating" });
    }

    if (!['sold', 'available', 'soon'].includes(status)) {
      return res.status(400).json({ error: "Please select a valid status" });
    }

    const compound = await Compound.findById(id);
    if (!compound) {
      return res.status(404).json({ error: "Compound not found" });
    }

    const compoundFolder = path.join("uploads", id);
    const videoFolder = path.join(compoundFolder, "videos");
    const imagesFolder = path.join(compoundFolder, "images");
    const pdfFolder = path.join(compoundFolder, "pdfs");

    const deleteFile = (folder, filename) => {
      const filePath = path.join(folder, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };

    // **تحديث الصور الجديدة أو الموجودة**
    let newImageIds = imageIds ? imageIds.split(",") : [];
    if (req.files?.images) {
      req.files.images.forEach((image) => {
        const imageId = `${uuidv4()}${path.extname(image.originalname)}`;
        newImageIds.push(imageId);
        fs.renameSync(image.path, path.join(imagesFolder, imageId));
      });

      // **حذف الصور القديمة اللي مش موجودة**
      compound.images.forEach((oldId) => {
        if (!newImageIds.includes(oldId)) {
          deleteFile(imagesFolder, oldId);
        }
      });
    }

    // **تحديث الـ Main Image**
    let newMainImage = compound.mainImage;
    if (req.files?.mainImage) {
      // حذف الصورة القديمة لو موجودة
      if (newMainImage) {
        deleteFile(imagesFolder, newMainImage);
      }

      // حفظ الصورة الجديدة
      const mainImageId = `${uuidv4()}${path.extname(req.files.mainImage[0].originalname)}`;
      fs.renameSync(req.files.mainImage[0].path, path.join(imagesFolder, mainImageId));

      // تحديث المتغير
      newMainImage = mainImageId;
    }

    // **تحديث الفيديو**
    let newVideoId = videoId;
    if (req.files?.video) {
      if (compound.video) {
        deleteFile(videoFolder, compound.video);
      }
      newVideoId = `${uuidv4()}${path.extname(req.files.video[0].originalname)}`;
      fs.renameSync(req.files.video[0].path, path.join(videoFolder, newVideoId));
    }

    // **تحديث الـ PDF**
    let newPdfId = pdfId;
    if (req.files?.pdf) {
      if (compound.pdf) {
        deleteFile(pdfFolder, compound.pdf);
      }
      newPdfId = `${uuidv4()}${path.extname(req.files.pdf[0].originalname)}`;
      fs.renameSync(req.files.pdf[0].path, path.join(pdfFolder, newPdfId));
    }

    // **تحديث الـ Database**
    const updatedCompound = await Compound.findByIdAndUpdate(
      id,
      {
        title,
        location,
        images: newImageIds,
        video: newVideoId,
        status,
        description,
        mainImage: newMainImage, // ✅ هنا بنسجل الـ ID الجديد
        address,
        map,
        pdf: newPdfId,
      },
      { new: true }
    );

    res.status(200).json({ message: "Compound updated successfully", compound: updatedCompound });
  } catch (error) {
    console.error("Error in updateCompound function:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteCompound = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid id" });
    }
    const deletedCompound = await Compound.findByIdAndDelete(id, {
      new: true,
    });
    if (!deletedCompound) {
      return res.status(401).json({ error: "compound not found" });
    }
    res.status(200).json(deletedCompound);
  } catch (error) {
    console.log("error in update compound function");
    console.log(error.message);
  }
};
