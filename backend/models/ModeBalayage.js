const mongoose = require("mongoose");

const PointSchema = new mongoose.Schema({
  tension: Number,
  cps: Number
}, { _id: false });

const ModeBalayageSchema = new mongoose.Schema({

  portique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portique"
  },

  LLD_depart: {
    type: Number
  },

  dV: {
    type: Number
  },

  Vmax: {
    type: Number
  },

  points: [PointSchema],

  date_creation: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "mode_balayage"
});

module.exports = mongoose.model("ModeBalayage", ModeBalayageSchema);