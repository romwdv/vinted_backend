const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const uid2 = require("uid2");
const sha256 = require("crypto-js/sha256"); // import du module pour encrypter
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/Users");

// 1 - Route login
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userLogin = await User.findOne({ email });
    // console.log(userLogin); // return null si not found
    if (!userLogin) {
      return res.status(400).json("Information incorrect");
    }
    // console.log(userLogin.hash); // J3vkR1Q+q7Fop/wn0IflZ0A5DxX94xVZDiT13lQfYxI=
    const { hash, salt, id, account } = userLogin;
    // console.log(account.username); // Robert
    // console.log(salt); // SJPlad05-_Whjb4J
    // console.log(id); // 6a032fc27fbef18f4b9e8320
    const newHash = encBase64.stringify(sha256(password + salt));
    // console.log(newHash); // J3vkR1Q+q7Fop/wn0IflZ0A5DxX94xVZDiT13lQfYxI=
    if (hash === newHash) {
      const token = uid2(30);
      const newToken = await User.findByIdAndUpdate(id, {
        token,
      });
      return res.status(200).json({
        id,
        token,
        account,
      });
    }
    res.status(400).json("Incorrect");
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
