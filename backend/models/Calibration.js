
const mongoose = require("mongoose");

// 📌 Schéma de calibration (stocke la relation énergie/amplitude)
const CalibrationSchema = new mongoose.Schema({

  source1: {
    name: String,        // Nom de la source 1
    energy: Number,      // énergie connue
    amplitude: Number    // amplitude mesurée
  },

  source2: {
    name: String,        // Nom de la source 2
    energy: Number,
    amplitude: Number
  },

  slope: Number,        // a dans E = aA + b
  offset: Number,       // b dans E = aA + b
  equation: String,     // représentation texte de la formule

  isActive: {           // 🔥 calibration utilisée en temps réel
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

// 📌 Export du modèle MongoDB
module.exports = mongoose.model("Calibration", CalibrationSchema);