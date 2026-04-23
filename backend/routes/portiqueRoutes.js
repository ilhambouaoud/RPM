const express = require("express");
const router = express.Router();
const Portique = require("../models/Portique");

router.get("/portiques", async (req, res) => {
  try {
    const portiques = await Portique.find();
    res.json(portiques);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/portiques", async (req, res) => {
  try {
    const portique = new Portique(req.body);
    await portique.save();

    res.json({
      message: "Portique ajouté avec succès",
      portique
    });

  } catch (error) {
    res.status(500).json({ error: "Erreur ajout portique" });
  }
});

router.get("/portiques/:id", async (req, res) => {
  try {
    const portique = await Portique.findById(req.params.id);

    if (!portique) {
      return res.status(404).json({ message: "Portique non trouvé" });
    }

    res.json(portique);

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;