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

        let avatar;
        if (req.files && req.files.avatar) {
          avatar = convertToBase64(req.files.avatar);
        }

        const newUserData = {
          email,
          account: {
            username,
          },
          token,
          hash,
          salt,
        };

        if (avatar) {
          newUserData.account.avatar = avatar;
        }

        const newUser = new User(newUserData);
        await newUser.save();

        if (avatar) {
          const avatarUpload = await cloudinary.uploader.upload(avatar, {
            folder: `/vinted/avatar/${newUser._id}`,
          });
          await User.findByIdAndUpdate(
            newUser._id,
            {
              $set: {
                "account.avatar": avatarUpload,
              },
            },
            { returnDocument: "after" },
          );
        }

        res.status(201).json(newUser);
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
