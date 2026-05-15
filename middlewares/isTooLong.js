const fileUpload = require("express-fileupload");

const isTooLong = (req, res, next) => {
  const { title, description, price, condition, city, brand, size, color } =
    req.body;

  if (title && title.length > 50) {
    return res.status(401).json("Titre trop long");
  }

  if (description && description.length > 500) {
    return res.status(401).json("Description trop longue");
  }

  if (price && price > 100000) {
    return res.status(401).json("Prix trop élevé");
  }

  next();
};

module.exports = isTooLong;
