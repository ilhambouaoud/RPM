// routes/calibrationRoutes.js

const express = require("express")
const router = express.Router()

const {
  calculateCalibration
} = require("../controllers/calibrationController")

router.post("/", calculateCalibration)

module.exports = router