// Check if offer exist & the request come from the offer owner

const mongoose = require("mongoose");

const User = require("../models/Users");
const Offer = require("../models/Offer");

const isOwner = async (req, res, next) => {
  try {
    const offer = await Offer.findOne({ _id: req.params.id });
    if (!offer) {
      return res.status(404).json("Offre non trouvée");
    }

    const ownerOffer = offer.owner._id.toString();
    const ownerToken = req.user.id;

    if (ownerOffer === ownerToken) {
      req.offerInfo = offer;
      return next();
    }

    return res.status(401).json("Unauthorized");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = isOwner;
