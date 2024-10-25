import mongoose from "mongoose";
import { Apartment } from "../models/Compound.schema.js";

export const getAllApartments = async (req, res) => {
  try {
    const { compoundId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(compoundId)) {
      return res.status(401).json({ error: "invalid id" });
    }
    const apartments = await Apartment.find({ compound: compoundId });
    console.log(apartments);
    res.status(200).json(apartments);
  } catch (error) {
    console.log("error in get all apartments function");
    console.log(error.message);
  }
};

export const addApartment = async (req, res) => {
  try {
    const { compoundId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(compoundId)) {
      return res.status(401).json({ error: "invalid id" });
    }
    const {
      mainImage,
      images,
      video,
      space,
      floor,
      bathrooms,
      description,
      status,
      rooms,
    } = req.body;

    if (
      !mainImage ||
      !images?.length ||
      !space ||
      !floor ||
      !status ||
      !bathrooms ||
      !description ||
      !rooms
    ) {
      return res.status(401).json({ error: "please fill all fields" });
    }

    if (status !== "sold" && status !== "available" && status !== "soon") {
      return res
        .status(400)
        .json({ error: "please select what is available in status" });
    }
    const newApartment = await Apartment.create({
      mainImage,
      images,
      video,
      space,
      floor,
      status,
      bathrooms,
      description,
      rooms,
      compound: compoundId,
    });

    res.status(200).json(newApartment);
  } catch (error) {
    console.log("error in add apartment function");
    console.log(error.message);
  }
};

export const updateApartment = async (req, res) => {
  const { compoundId } = req.params;
  console.log(compoundId)
  try {
    if (!mongoose.Types.ObjectId.isValid(compoundId)) {
      return res.status(400).json({ error: "invalid id" });
    }
    const {
      mainImage,
      images,
      video,
      space,
      floor,
      bathrooms,
      description,
      status,
      rooms,
    } = req.body;

    if (
      !mainImage ||
      !images?.length ||
      !space ||
      !floor ||
      !status ||
      !bathrooms ||
      !description ||
      !rooms
    ) {
      return res.status(401).json({ error: "please update atleast one thing" });
    }
    if (status !== "sold" && status !== "available" && status !== "soon") {
      return res
        .status(400)
        .json({ error: "please select what is available in status" });
    }
    const updatedApartment = await Apartment.findByIdAndUpdate(
      compoundId,
      {
        mainImage,
        images,
        video,
        space,
        floor,
        bathrooms,
        description,
        status,
        rooms,
      },
      {
        new: true,
      }
    );
    if (!updatedApartment) {
      return res.status(401).json({ error: "apartment not found" });
    }
    res.status(200).json(updatedApartment);
  } catch (error) {
    console.log("error in update apartment function");
    console.log(error.message);
  }
};


export const deleteApartment = async (req,res)=>{
    const {compoundId} = req.params
     
    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({error:"invalid id"})
        }
        const deletedCompound = await Apartment.findByIdAndDelete(compoundId,{
            new:true
        })
        if(!deletedCompound){
            return res.status(401).json({error:"apartment not found"})
        }
        res.status(200).json(deletedCompound)
    } catch (error) {
        console.log("error in delete apartment function")
        console.log(error.message)
    }
}