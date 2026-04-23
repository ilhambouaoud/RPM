const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Mesure = require("../models/Mesures");

router.get("/mesure/latest/:portiqueId", async (req, res) => {

  const { portiqueId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(portiqueId)) {
    return res.status(400).json({ message: "ID portique invalide" });
  }

  const mesure = await Mesure.findOne({
    portique_id: new mongoose.Types.ObjectId(portiqueId)
  }).sort({ date_mesure: -1 });

  res.json(mesure);
});

router.get("/mesure/chart/:portiqueId", async (req, res) => {

  const { portiqueId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(portiqueId)) {
    return res.status(400).json({ message: "ID portique invalide" });
  }

  const mesures = await Mesure.find({
    portique_id: new mongoose.Types.ObjectId(portiqueId)
  })
    .sort({ date_mesure: -1 })
    .limit(20);

  res.json(mesures.reverse());
});

module.exports = router;