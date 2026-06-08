const bcrypt = require("bcrypt");
const Utilisateur = require("../models/Utilisateur");
const authSession = require("../middleware/authSession");
const isAdmin = require("../middleware/isAdmin");
const express = require("express");

const router = express.Router();

// Controllers
const {
  getMe,
  updateUser
} = require("../controllers/userController");

/* =========================
   GET USER CONNECTÉ
========================= */

router.get(
  "/me",
  getMe
);

/* =========================
   UPDATE USER CONNECTÉ
========================= */

router.put(
  "/user/update/:id",
  updateUser
);

/* =========================
   LISTE DES UTILISATEURS
========================= */

router.get(
  "/all",
  authSession,
  isAdmin,
  async (req, res) => {

    try {

      const users = await Utilisateur.find({
        _id: { $ne: req.session.userId }
      }).select("-password_hash");

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);
/* =========================
   CREATE USER
========================= */

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

      const exist =
        await Utilisateur.findOne({
          email
        });

      if (exist) {

        return res.status(400).json({
          message: "Email déjà utilisé"
        });

      }

      const password_hash =
        await bcrypt.hash(
          password,
          10
        );

      const newUser =
        new Utilisateur({

          username,

          email,

          password_hash,

          role: role || "user",

          is_active:
            is_active !== undefined
              ? is_active
              : true,

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

/* =========================
   EDIT USER
========================= */

router.put(
  "/edit/:id",

  authSession,

  isAdmin,

  async (req, res) => {

    try {

      const {

        username,
        email,
        role,
        is_active

      } = req.body;

      const user =
        await Utilisateur
          .findByIdAndUpdate(

            req.params.id,

            {
              username,
              email,
              role,
              is_active
            },

            {
              new: true
            }

          );

      res.json({

        message:
          "Utilisateur modifié",

        user

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);

/* =========================
   DELETE USER
========================= */

router.delete(
  "/delete/:id",

  authSession,

  isAdmin,

  async (req, res) => {

    try {

      await Utilisateur
        .findByIdAndDelete(
          req.params.id
        );

      res.json({

        message:
          "Utilisateur supprimé"

      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);

/* =========================
   LOGOUT
========================= */

router.post(
  "/logout",

  async (req, res) => {

    try {

      if (req.session.userId) {

        await Utilisateur
          .findByIdAndUpdate(

            req.session.userId,

            {
              last_login:
                new Date()
            }

          );

      }

      req.session.destroy(

        (err) => {

          if (err) {

            return res
              .status(500)
              .json({
                message:
                  "Erreur logout"
              });

          }

          res.json({
            message:
              "Logout successful"
          });

        }

      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }
);

module.exports = router;