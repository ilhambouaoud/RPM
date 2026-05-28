const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password_hash: String,
  role: String,
  is_active: Boolean,
  last_login: Date,
  date_creation: Date,
});

const Utilisateur = mongoose.model(
  "Utilisateur",
  UserSchema,
  "utilisateurs" // 👈 NOM EXACT DE LA COLLECTION
);

module.exports = Utilisateur;