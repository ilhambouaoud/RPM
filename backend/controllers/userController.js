const Utilisateur = require("../models/Utilisateur");
const bcrypt = require("bcrypt");


// ✅ GET ME
exports.getMe = async (req, res) => {
  try {

    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Non authentifié"
      });
    }

    const user = await Utilisateur.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email
    });

  } catch (error) {

    console.error("GET ME ERROR:", error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};



// ✅ UPDATE USER
exports.updateUser = async (req, res) => {

  try {

    console.log("BODY =", req.body);

    const { username, email, password } = req.body;

    // données à modifier
    const updateData = {
      username,
      email
    };

    // 🔐 HASH PASSWORD
    if (password && password.trim() !== "") {

      console.log("PASSWORD RECU =", password);

      // génération salt
      const salt = await bcrypt.genSalt(10);

      // hash password
      const hashedPassword = await bcrypt.hash(
        password,
        salt
      );

      console.log("HASH =", hashedPassword);

      // sauvegarde hash
      updateData.password_hash = hashedPassword;
    }

    console.log("UPDATE DATA =", updateData);

    // update user
    const updatedUser = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      message: "Utilisateur mis à jour",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });

  } catch (error) {

    console.error("UPDATE ERROR:", error);

    res.status(500).json({
      message: "Erreur serveur"
    });
  }
};