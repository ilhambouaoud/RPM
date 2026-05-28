const express = require("express");
const router = express.Router();

// 👉 importer les fonctions depuis le controller
const { getMe, updateUser } = require("../controllers/userController");

// ✅ ROUTE : récupérer utilisateur connecté
router.get("/me", getMe);

// ✅ ROUTE : mettre à jour utilisateur
router.put("/user/update/:id", updateUser);

// 👉 export du router
module.exports = router;