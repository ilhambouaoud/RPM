const express = require("express");
const router = express.Router();

const controller = require("../controllers/controleController");

// 🔥 CORRIGÉ : POST + route cohérente
router.post("/send-trame", controller.sendTrame);

router.get("/controle", async (req, res) => {
  const last = await require("../models/Controle")
    .findOne()
    .sort({ date: -1 });

  res.json(last);
});

router.post("/barriere", async (req, res) => {
  const { state } = req.body;

  const Controle = require("../models/Controle");

  const controle = new Controle({
    barriere: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Barrière mise à jour" });
});

router.post("/alarme", async (req, res) => {
  const { state } = req.body;

  const Controle = require("../models/Controle");

  const controle = new Controle({
    alarme: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Alarme mise à jour" });
});

module.exports = router;