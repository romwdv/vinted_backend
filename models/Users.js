const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: { type: Object, default: null },
  },
  newsletter: { type: Boolean, default: false },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
