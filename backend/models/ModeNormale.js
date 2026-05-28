const mongoose = require("mongoose");

const ModeNormaleSchema = new mongoose.Schema({

  portique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portique"
  },

  LLD: {
    type: Number
  },

  HLD: {
    type: Number
  },

  HT: {
    type: Number
  },

  mode_mesure: {
    type: String
  },

  mesure: {
    type: Number
  },

  date_creation: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "mode_normale"
});

module.exports = mongoose.model("ModeNormale", ModeNormaleSchema);