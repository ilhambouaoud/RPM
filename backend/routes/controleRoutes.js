const express = require("express");
const router = express.Router();
const Controle = require("../models/Controle");


const controller = require("../controllers/controleController");

router.get("/send-trame", controller.sendTrame);




router.get("/controle", async (req, res) => {
  const last = await Controle.findOne().sort({ date: -1 });
  res.json(last);
});

router.post("/barriere", async (req, res) => {
  const { state } = req.body;

  const controle = new Controle({
    barriere: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Barrière mise à jour" });
});

router.post("/alarme", async (req, res) => {
  const { state } = req.body;

  const controle = new Controle({
    alarme: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Alarme mise à jour" });
});

module.exports = router;