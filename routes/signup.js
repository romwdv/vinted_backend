const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const uid = require("uid2");
const sha256 = require("crypto-js/sha256"); // import du module pour encrypter
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const User = require("../models/Users");
const uid2 = require("uid2");

const convertToBase64 = require("../function/convertBase64");

// 1 - Route Signup

router.post("/user/signup", fileUpload(), async (req, res) => {
  console.log(req.files.avatar);
  try {
    const { username, email, password } = req.body;
    // console.log(username); // return true
    const emailExist = await User.findOne({ email });
    // console.log(emailExist); // null
    const usernameExist = await User.findOne({ username });
    // console.log(usernameExist); // null
    if (username) {
      if (emailExist === null && usernameExist === null) {
        const token = uid2(30);
        const salt = uid2(16);
        const saltedPwd = password + salt;
        const hash = encBase64.stringify(sha256(saltedPwd));
        const avatar = convertToBase64(req.files.avatar);

        const newUser = new User({
          email,
          account: {
            username,
          },
          token,
          hash,
          salt,
        });
        await newUser.save();
        const idUser = newUser._id.toString();
        const avatarUpload = await cloudinary.uploader.upload(avatar, {
          folder: `/vinted/avatar/${idUser}`,
        });
        const userAvatarUpdate = await User.findByIdAndUpdate(
          idUser,
          {
            $set: {
              "account.avatar": avatarUpload,
            },
          },
          { returnDocument: "after" },
        );
        res.status(201).json(userAvatarUpdate);
      } else {
        res.status(400).json("Informations invalides");
      }
    } else {
      return res.status(400).json("Informations manquantes");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
