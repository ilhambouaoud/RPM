const Calibration = require("../models/Calibration");

// 📌 Service : récupère calibration active et convertit amplitude → énergie
class CalibrationService {

  // 📌 récupérer calibration active
  static async getActiveCalibration() {

    const calibration = await Calibration.findOne({ isActive: true });

    if (!calibration) {
      throw new Error("Aucune calibration active trouvée");
    }

    return calibration;
  }

  // 📌 convertir tension (amplitude) → énergie
  static async convertAmplitudeToEnergy(amplitude) {

    const calibration = await this.getActiveCalibration();

    // 📌 application de la formule
    return calibration.slope * amplitude + calibration.offset;
  }
}

module.exports = CalibrationService;