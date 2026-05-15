const mongoosse = require("mongoose");

const User = require("../models/Users");

const isAuthentified = async (req, res, next) => {
  if (req.headers.authorization) {
    const tokenClean = req.headers.authorization.replace("Bearer ", "");
    const userFound = await User.findOne({ token: tokenClean }).select(
      "account",
    );

    if (userFound) {
      req.user = userFound;
      next();
    } else {
      return res.status(401).json("Unauthorized");
    }
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthentified;
