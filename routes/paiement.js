const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/paiement", async (req, res) => {
  try {
    console.log("Données reçues:", req.body);
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: req.body.amount,
      // Devise de la transaction
      currency: req.body.currency,
      payment_method_types: ["card"],
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    console.error("Erreur Stripe:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
