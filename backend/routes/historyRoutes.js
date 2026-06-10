const express = require("express");

const router = express.Router();

const {
  getNormalHistory,
  getNormalDetails,
  getBalayageHistory,
  getBalayageDetails
} = require("../controllers/historyController");

// ================= NORMAL =================

router.get(
  "/normal",
  getNormalHistory
);

router.get(
  "/normal/:id",
  getNormalDetails
);

// ================= BALAYAGE =================

router.get(
  "/balayage",
  getBalayageHistory
);

router.get(
  "/balayage/:id",
  getBalayageDetails
);

module.exports = router;