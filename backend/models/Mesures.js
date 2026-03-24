const mongoose = require("mongoose");

const MesureSchema = new mongoose.Schema({
  cps: Number,
  cpm: Number,
  tension: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mesure", MesureSchema);