const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  username: String,

  email: String,

  password_hash: String,

  role: {
    type: String,
    default: "user"
  },

  is_active: {
    type: Boolean,
    default: true
  },

  last_login: Date,

  date_creation: {
    type: Date,
    default: Date.now
  }

}, {
  collection: "utilisateurs"
});

module.exports = mongoose.model("Utilisateur", UserSchema);