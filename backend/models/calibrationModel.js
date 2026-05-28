const Calibration = require("./Calibration")

class CalibrationModel {

  static async calculateAndSave(source1, source2) {

    const A1 = source1.amplitude
    const A2 = source2.amplitude

    const E1 = source1.energy
    const E2 = source2.energy

    const slope = (E2 - E1) / (A2 - A1)
    const offset = E1 - slope * A1

    const equation = `E = ${slope.toFixed(4)} * A + ${offset.toFixed(4)}`

    // 🔥 SAVE IN MONGODB
    const calibration = new Calibration({
      source1,
      source2,
      slope,
      offset,
      equation
    })

    await calibration.save()

    return { slope, offset, equation }
  }
}

module.exports = CalibrationModel