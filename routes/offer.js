const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
// router.use(express.json());

const User = require("../models/Users");
const Offer = require("../models/Offer");
const cloudinary = require("cloudinary").v2;

const convertToBase64 = require("../function/convertBase64");

/// Middlewares :

const isAuthentified = require("../middlewares/isAuthentified");
const isOwner = require("../middlewares/isOwner");
const isTooLong = require("../middlewares/isTooLong");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1 - Route post offer

router.post(
  "/offer/publish",
  isAuthentified,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      //   console.log(req.user.id); // 6a032fc27fbef18f4b9e8320
      // console.log(userFound.id); // 6a032f957fbef18f4b9e831f
      // console.log(title); // "Pantalon"
      // console.log(req.files); // picture object
      const imgConverted = convertToBase64(req.files.picture);
      // console.log(imgConverted); // picture base64
      const newOffer = await new Offer({
        product_name: title,
        product_description: description,
        product_price: Number(price),
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ETAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            CITY: city,
          },
        ],
        // product_image: uploadResult,
        owner: req.user.id,
      });
      await newOffer.save();
      const idOffer = newOffer._id.toString();
      const uploadResult = await cloudinary.uploader.upload(imgConverted, {
        folder: `/vinted/offers/${idOffer}`,
      });
      // opti possible en
      const newOfferWithImg = await Offer.findByIdAndUpdate(idOffer, {
        product_image: uploadResult,
      });

      // console.log(uploadResult); // Cloudinary result
      res.status(200).json(newOfferWithImg);
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
);
// 2 - Route delete offer
router.delete(
  "/offer/delete/:id",
  isAuthentified,
  isOwner,
  async (req, res) => {
    try {
      // console.log(req.params.id); // 4554545454 -> id offer (from params)
      // console.log(req.user.id); // 6a032f957fbef18f4b9e831f -> id User (from token)
      // console.log(offer.owner._id.toString()); // 6a032f957fbef18f4b9e831f
      const OfferToDelete = req.offerInfo.id;
      const imgToDelete = req.offerInfo.product_image.asset_id;
      const folderImgTodelete = req.offerInfo.product_image.asset_folder;
      await cloudinary.api.delete_resources_by_asset_ids(imgToDelete);
      await cloudinary.api.delete_folder(folderImgTodelete);
      await Offer.findByIdAndDelete(OfferToDelete);
      res.status(202).json("Offre supprimée");
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
);

// 3 - Search offers
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    // console.log(req.query); // { title: 'pantalon', color: 'blanc' }
    const queryfilter = {};
    const querySort = {};
    let limit = 0;
    let skip = 0;
    if (title) {
      queryfilter.product_name = new RegExp(title, "i");
    }

    if (priceMin || priceMax) {
      queryfilter.product_price = {};
      if (priceMin) {
        queryfilter.product_price.$gte = Number(priceMin);
      }
      if (priceMax) {
        queryfilter.product_price.$lte = Number(priceMax);
      }
    }

    if (sort) {
      if (sort === "price-desc") {
        querySort.product_price = "desc";
      }
    } else {
      querySort.product_price = "asc";
    }

    if (page) {
      limit = 5;
      skip = limit * (page - 1);
    }
    // console.log(querySort); // { product_price: 'asc' }
    const count = await Offer.countDocuments(queryfilter);
    const results = await Offer.find(queryfilter)
      .select("product_name product_description product_price city owner -_id")
      .populate("owner", "account.username -_id")
      .sort(querySort)
      .limit(limit)
      .skip(skip);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// 4 - Offer detail
router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("owner");
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// 5 - offer update

router.put(
  "/offer/update/:id",
  isAuthentified,
  isOwner,
  fileUpload(),
  isTooLong,
  async (req, res) => {
    const updateQuery = {};
    try {
      const { title, price, description } = req.body;

      if (title) {
        updateQuery.product_name = title;
      }
      if (price) {
        updateQuery.product_price = price;
      }
      if (description) {
        updateQuery.product_description = description;
      }

      const update = await Offer.findByIdAndUpdate(req.params.id, updateQuery);

      res.status(200).json(update);
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
);
/// ⚠️ Routes test

router.post(
  "/offer/test/publish",
  fileUpload(),
  isTooLong,
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      //   console.log(req.user.id); // 6a032fc27fbef18f4b9e8320
      // console.log(userFound.id); // 6a032f957fbef18f4b9e831f
      // console.log(title); // "Pantalon"
      // console.log(req.files); // picture object
      console.log(title.length);

      // console.log(uploadResult); // Cloudinary result
      res.status(200).json("test");
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
);

module.exports = router;
