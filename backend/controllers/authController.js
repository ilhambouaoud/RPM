const Utilisateur = require("../models/Utilisateur");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    console.log("LOGIN BODY =", req.body);

    // ✅ chercher utilisateur par email
    const user = await Utilisateur.findOne({ email });

    console.log("USER FOUND =", user);

    // ✅ utilisateur existe ?
    if (!user) {
      return res.status(401).json({
        message: "Utilisateur introuvable"
      });
    }

    // ✅ compte actif ?
    if (!user.is_active) {
      return res.status(403).json({
        message: "Compte désactivé"
      });
    }

    // ✅ comparer bcrypt
    console.log("PASSWORD FROM LOGIN =", password)
    console.log("HASH FROM DB =", user.password_hash)
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log("PASSWORD MATCH =", isMatch);

    // ✅ mauvais mot de passe
    if (!isMatch) {
      return res.status(401).json({
        message: "Mot de passe incorrect"
      });
    }

    // ✅ créer session
    req.session.userId = user._id;

    console.log("SESSION USER ID =", req.session.userId);

    // ✅ sauvegarder session
    req.session.save(async (err) => {

      if (err) {

        console.log("SESSION SAVE ERROR =", err);

        return res.status(500).json({
          message: "Erreur session"
        });
      }

      // ✅ update last login
      user.last_login = new Date();
      await user.save();

      console.log("SESSION SAVED SUCCESS");

      // ✅ réponse frontend
      res.json({
        message: "Login success",

        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};