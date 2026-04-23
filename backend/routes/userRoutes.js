const express = require("express");
const router = express.Router();
const Utilisateur = require("../models/Utilisateur");

router.get("/me", async (req, res) => {
  try {
    const userId = req.session?.userId;

    const user = await Utilisateur.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

router.post("/user/update/:id", async (req, res) => {
  const { username, email, password } = req.body;

  const updatedUser = await Utilisateur.findByIdAndUpdate(
    req.params.id,
    {
      username,
      email,
      password_hash: password
    },
    { new: true }
  );

  res.json({
    message: "Utilisateur mis à jour",
    user: updatedUser
  });
});

module.exports = router;