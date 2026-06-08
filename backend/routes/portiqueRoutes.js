const express = require("express");
const router = express.Router();
const Portique = require("../models/Portique");
const authSession = require("../middleware/authSession");
const isAdmin = require("../middleware/isAdmin");
router.get("/portiques", async (req, res) => {
  try {
    const portiques = await Portique.find();
    res.json(portiques);
  } catch (error) {

  console.log("PORTIQUE ERROR =", error);

  res.status(500).json({
    message: error.message
  });
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

router.put(
  "/portiques/:id",
  async (req, res) => {

    try {

      const portique =
        await Portique.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true
          }
        )

      if (!portique) {
        return res.status(404).json({
          message: "Portique non trouvé"
        })
      }

      res.json(portique)

    } catch (error) {

      console.log("UPDATE ERROR =", error)

      res.status(500).json({
        message: error.message
      })

    }
  }
)
router.delete(
  "/portiques/:id",
  authSession,
  isAdmin,
  async (req, res) => {

    try {

      await Portique.findByIdAndDelete(
        req.params.id
      )

      res.json({
        message: "Portal deleted"
      })

    } catch (error) {
      res.status(500).json({
        message: error.message
      })
    }
  }
)
module.exports = router;