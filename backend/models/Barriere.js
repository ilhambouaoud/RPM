const mongoose = require("mongoose");

const BarriereSchema = new mongoose.Schema({

  portique_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Portique"
  },

  etat: String,

  derniere_commande: String,

  date_update: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "barrieres"
});

module.exports = mongoose.model("Barriere", BarriereSchema);