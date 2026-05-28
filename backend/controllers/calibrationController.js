const CalibrationModel = require("../models/calibrationModel")

const calculateCalibration = async (req, res) => {

  try {

    const { source1, source2 } = req.body

    const result = await CalibrationModel.calculateAndSave(source1, source2)

    res.json(result)

  } catch (error) {

    res.status(500).json({
      error: error.message
    })
  }
}

module.exports = {
  calculateCalibration
}