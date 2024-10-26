
import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId },"secret", {
    expiresIn: "11d",
  });
  res.cookie("jwt",token,{
    maxAge: 1000* 60 * 60 * 24 * 15,
    httpOnly:true,
    sameSite:"strict",
    // secure:process.env.NODE_ENV !== "development"
    secure:false
  })
};

export default generateToken;
 