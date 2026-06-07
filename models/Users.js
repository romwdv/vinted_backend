const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    account: {
      username: String,
      avatar: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    newsletter: { type: Boolean, default: false },
    token: String,
    hash: String,
    salt: String,
  },
  {
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
