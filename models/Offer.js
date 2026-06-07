const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    product_name: String,
    product_description: String,
    product_price: Number,
    product_details: Array,
    product_image: mongoose.Schema.Types.Mixed,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
