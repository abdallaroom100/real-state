const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  return res.status(200).json({
    title: "you are gonna did",
    message: "hello everyone!",
  });
});

module.exports = router;
