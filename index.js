require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const signup = require("./routes/signup");
const login = require("./routes/login");
const offer = require("./routes/offer");

app.use(express.json());
app.use(signup);
app.use(login);
app.use(offer);
app.use(cors());

// Catch routes not found
app.all(/.*/, (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});
app.listen(process.env.PORT, () => {
  console.log("Serveur Vinted On 👚");
});
