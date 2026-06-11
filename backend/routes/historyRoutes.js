const express = require("express");

const router = express.Router();

const {
  getNormalHistory,
  getNormalDetails,
  getBalayageHistory,
  getBalayageDetails
} = require("../controllers/historyController");

// ================= NORMAL =================

// historique d'un portique
router.get(
  "/normal/:portiqueId",
  getNormalHistory
);

// détails d'une session
router.get(
  "/normal/details/:id",
  getNormalDetails
);

// ================= BALAYAGE =================

// historique d'un portique
router.get(
  "/balayage/:portiqueId",
  getBalayageHistory
);

// détails d'une session
router.get(
  "/balayage/details/:id",
  getBalayageDetails
);

module.exports = router;