const mongoose = require("mongoose");

const AlarmeSchema = new mongoose.Schema({

  portique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portique"
  },

  etat: {
    type: String,
    default: "inactive"
  },

  derniere_activation: {
    type: Date,
    default: null
  },

  date_update: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "alarmes"
});

module.exports = mongoose.model("Alarme", AlarmeSchema);