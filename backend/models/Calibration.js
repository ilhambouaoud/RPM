const mongoose = require("mongoose")

const CalibrationSchema = new mongoose.Schema({

  source1: {
    name: String,
    energy: Number,
    amplitude: Number
  },

  source2: {
    name: String,
    energy: Number,
    amplitude: Number
  },

  slope: Number,
  offset: Number,
  equation: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Calibration", CalibrationSchema)