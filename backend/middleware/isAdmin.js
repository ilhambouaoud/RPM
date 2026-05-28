const Utilisateur = require("../models/Utilisateur")

module.exports = async (req, res, next) => {

  try {

    const user = await Utilisateur.findById(
      req.session.userId
    )

    console.log("ADMIN USER =", user)

    if (!user) {

      return res.status(404).json({
        message: "Utilisateur introuvable"
      })

    }

    if (user.role !== "admin") {

      return res.status(403).json({
        message: "Accès refusé"
      })

    }

    next()

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Erreur serveur"
    })

  }

}