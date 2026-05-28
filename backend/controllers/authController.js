const Utilisateur = require("../models/Utilisateur");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    console.log("LOGIN BODY =", req.body);

    // chercher user
    const user = await Utilisateur.findOne({ email });

    console.log("USER FOUND =", user);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    // vérifier actif
    if (!user.is_active) {
      return res.status(403).json({
        message: "Account disabled"
      });
    }

    // ✅ comparer bcrypt
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log("PASSWORD MATCH =", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    // ✅ créer session
    req.session.userId = user._id;

    console.log("SESSION USER ID =", req.session.userId);

    // sauvegarder session
    req.session.save(async (err) => {

      if (err) {

        console.log("SESSION SAVE ERROR =", err);

        return res.status(500).json({
          message: "Session error"
        });
      }

      // update last login
      user.last_login = new Date();
      await user.save();

      console.log("SESSION SAVED SUCCESS");

      res.json({
        message: "Login success",
        role: user.role,
        username: user.username,
        userId: user._id
      });

    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};