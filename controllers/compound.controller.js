import mongoose from "mongoose"
import { Compound } from "../models/Compound.schema.js"



export const getAllCompounds = async (req,res)=>{
 
    try {
        const compounds = await Compound.find()
        console.log(compounds)
        res.status(200).json(compounds)
    } catch (error) {
        console.log("error in get all compound function")
        console.log(error.message)
    }
}

export const addCompound = async (req,res)=>{
    try {
        const {mainImage,images,title,location,status, video} = req.body

        console.log(mainImage,images,title,location,status)
        if(!mainImage || !images?.length  || !title|| !location || !status){
            return res.status(401).json({error:"please fill all fields"})
        }
        if(status !== "sold" && status !== "available" && status !== "soon"){
            return res.status(400).json({error:"من فضلك اختار الخيارات المتاحه في خانه الحاله"})
        }
        const newCompound = await Compound.create({
            mainImage,images,title,location,status,video
        })

        res.status(200).json(newCompound)
    } catch (error) {
        console.log("error in add compound function")
        console.log(error.message)
    }
}

export const updateCompound = async (req,res)=>{
    const {id} = req.params

    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({error:"invalid id"})
        }
        const {title,mainImage,location,images,status,video} = req.body
        if(!images.length && mainImage && !title && !location && !status){
            return res.status(401).json({error:"من فضلك قم بتعديل خانه واحده علي الاقل"})
        }
        if(status !== "sold" && status !== "available" && status !== "soon"){
            return res.status(400).json({error:"من فضلك اختار الخيارات المتاحه في خانه الحاله"})
        }
        const updatedCompound = await Compound.findByIdAndUpdate(id,{
            title,
            location,
            mainImage,
            video,
            images,
            status
        },{
            new:true
        })
        if(!updatedCompound){
            return res.status(401).json({error:"compound not found"})
        }
        res.status(200).json(updatedCompound)
    } catch (error) {
        console.log("error in update compound function")
        console.log(error.message)
    }
}

export const deleteCompound = async (req,res)=>{
    const {id} = req.params
     
    try {
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({error:"invalid id"})
        }
        const deletedCompound = await Compound.findByIdAndDelete(id,{
            new:true
        })
        if(!deletedCompound){
            return res.status(401).json({error:"compound not found"})
        }
        res.status(200).json(deletedCompound)
    } catch (error) {
        console.log("error in update compound function")
        console.log(error.message)
    }
}