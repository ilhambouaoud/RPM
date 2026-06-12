const mongoose = require("mongoose");

// 📌 chaque point du balayage
const PointSchema = new mongoose.Schema({

  tension: Number,   // amplitude moyenne du signal
  cps: Number,       // fréquence comptée
  energy: Number     // 🔥 énergie calculée via calibration

}, { _id: false });

// 📌 session balayage complète
const ModeBalayageSchema = new mongoose.Schema({

  portique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portique"
  },

  LLD_depart: Number,
  dV: Number,
  Vmax: Number,

  points: [PointSchema], // 📌 tableau de mesures

  date_creation: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "mode_balayage"
});

module.exports = mongoose.model("ModeBalayage", ModeBalayageSchema);