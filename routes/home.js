import express from "express"
const router = express.Router();

router.get("/projects", async (req, res, next) => {
  return res.status(200).json({
    title: "you are gonna did",
    message: "hello everyone!",
  });
});

export default router

