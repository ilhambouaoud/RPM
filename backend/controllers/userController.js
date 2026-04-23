const Utilisateur = require("../models/Utilisateur");

exports.getMe = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  const updatedUser = await Utilisateur.findByIdAndUpdate(
    req.params.id,
    {
      username,
      email,
      password_hash: password
    },
    { new: true }
  );

  res.json({
    message: "Utilisateur mis à jour",
    user: updatedUser
  });
};