const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Backend RPM fonctionne");
});

router.get("/api/test", (req, res) => {
  res.json({ message: "Connexion réussie avec Vue" });
});

module.exports = router;