const bcrypt = require("bcrypt");
const Utilisateur = require("../models/Utilisateur");
const authSession = require("../middleware/authSession");
const isAdmin = require("../middleware/isAdmin");
const express = require("express");

const router = express.Router();

// importer controller
const {
  getMe,
  updateUser
} = require("../controllers/userController");

// GET USER
router.get("/me", getMe);

// UPDATE USER
router.put(
  "/user/update/:id",
  updateUser
);

// CREATE USER
router.post(

  "/create",

  authSession,

  isAdmin,

  async (req, res) => {

    try {

      const {
        username,
        email,
        password,
        role,
        is_active
      } = req.body;

      // email existe ?
      const exist =
        await Utilisateur.findOne({
          email
        });

      if (exist) {

        return res.status(400).json({
          message: "Email déjà utilisé"
        });

      }

      // hash password
      const password_hash =
        await bcrypt.hash(
          password,
          10
        );

      // create user
      const newUser =
        new Utilisateur({

          username,

          email,

          password_hash,

          role,

          is_active,

          date_creation:
            new Date(),

          last_login: null

        });

      await newUser.save();

      res.status(201).json({

        message:
          "Utilisateur créé",

        user: newUser

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: error.message
      });

    }

  }

);
router.post("/logout", async (req, res) => {

  try {

    // update last_login
    await Utilisateur.findByIdAndUpdate(
      req.session.userId,
      {
        last_login: new Date()
      }
    );

    // destroy session
    req.session.destroy((err) => {

      if (err) {

        return res.status(500).json({
          message: "Erreur logout"
        });

      }

      res.json({
        message: "Logout successful"
      });

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

// export
module.exports = router;