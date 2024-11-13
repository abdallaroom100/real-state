import mongoose from "mongoose";
import User from "../models/User.schema.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

export const getCurrentUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req?.userId)) {
      return res.status(400).json({ error: "invalid id" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "user not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log(`error in get current user function`);
    console.log(error.message);
  }
};

export const signUpUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ error: "plase fill all fields" });
    }
    if(password.length < 6){
        return res.status(400).json({ error: "password must be atleast 6 chars" });
    }
    if(username.length < 3){
        return res.status(400).json({ error: "username must be atleast 3 chars" });
    }
     const user = await User.findOne({username})
     if(user) return res.status(400).json({error:"this username is already exist"})
    const hash = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      username,
      password: hash,
    });
    generateToken(newUser._id, res);
    res.status(200).json(newUser);
  } catch (error) {
    console.log(`error in signup user function`);
    console.log(error.message);
  }
};
export const loginUser = async (req, res) => {

  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ error: "plase fill all fields" });
    }
    if(password.length < 6){
        return res.status(400).json({ error: "password must be atleast 6 chars" });
    }
    if(username.length < 3){
        return res.status(400).json({ error: "username must be atleast 3 chars" });
    }

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: "user not found" });
    }
    const Vpassword = bcrypt.compareSync(password, user.password);
    if (!Vpassword){
        return res.status(401).json({ error: "password is incorrect" });
    }
    generateToken(user._id, res);
    res.status(200).json(user);
  } catch (error) {
    console.log(`error in login user function`);
    console.log(error.message);
  }
};

export const deleteUser = async (req,res)=>{
    const {userId} = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "invalid id" });
          }
        const user = await User.findByIdAndDelete(userId,{
            new:true
        })
        if (!user) {
            return res.status(401).json({ error: "user not found" });
        }
        return res.status(200).json("user has deleted successfully")
    } catch (error) {
        console.log(`error in delete user function`);
        console.log(error.message);
    }
}
export const updateUser = async (req,res)=>{
    const {userId} = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "invalid id" });
          }
        const {username,password} = req.body
        if (!username && !password) {
            return res.status(400).json({ error: "plase fill at least one field" });
          }
          if(password.length < 6){
            return res.status(400).json({ error: "password must be atleast 6 chars" });
        }
        if(username.length < 3){
            return res.status(400).json({ error: "username must be atleast 3 chars" });
        }
  const existUser = await User.findOne({username})
  if(existUser) 
       if(username){
        return res.status(400).json({error:"this username is already exist"})
       }
        const hash = bcrypt.hashSync(password,10)
        const user = await User.findByIdAndUpdate(userId,{
            username,
            password:hash
        },{new:true})

        if (!user) {
            return res.status(401).json({ error: "user not found" });
        }
        return res.status(200).json(user)
    } catch (error) {
        console.log(`error in delete user function`);
        console.log(error.message);
    }
}

export const logOut = async (req, res) => {
    try {
      res.cookie('jwt', '', {
        httpOnly: true,
        secure: true,
        expires: new Date(0),  
    });
    } catch (error) {
      console.log(`error in logout user function`);
      console.log(error.message);
    }
  };

