const express = require("express");
const router = express.Router();
const Utilisateur = require("../models/Utilisateur");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Utilisateur.findOne({ email });

    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.is_active) return res.status(403).json({ message: "Account disabled" });
    if (password !== user.password_hash)
      return res.status(401).json({ message: "Invalid password" });

    user.last_login = new Date();
    await user.save();

    res.json({
      message: "Login success",
      token: "secure-token",
      role: user.role,
      username: user.username
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;