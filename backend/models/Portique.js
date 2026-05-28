const mongoose = require("mongoose");

const PortiqueSchema = new mongoose.Schema({
  nom: String,
  localisation: String,
  etat: String,
  tension_actuelle: Number,
  date_maintenance: Date,
  date_creation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "Portique",
  PortiqueSchema,
  "portiques" // 👈 nom EXACT dans MongoDB
);