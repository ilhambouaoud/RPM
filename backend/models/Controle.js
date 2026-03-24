// models/Controle.js
const mongoose = require("mongoose");

const ControleSchema = new mongoose.Schema({
  barriere: Boolean,
  alarme: Boolean,
  date: Date,
});

module.exports = mongoose.model("Controle", ControleSchema);