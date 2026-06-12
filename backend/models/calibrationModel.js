const Calibration = require("./Calibration");

// 📌 Classe métier : calcule et sauvegarde la calibration
class CalibrationModel {

  static async calculateAndSave(source1, source2) {

    // 📌 lecture des amplitudes
    const A1 = source1.amplitude;
    const A2 = source2.amplitude;

    // 📌 lecture des énergies
    const E1 = source1.energy;
    const E2 = source2.energy;

    // 📌 calcul de la pente (a)
    // formule physique : a = (E2 - E1) / (A2 - A1)
    const slope = (E2 - E1) / (A2 - A1);

    // 📌 calcul de l’offset (b)
    // b = E1 - a × A1
    const offset = E1 - slope * A1;

    // 📌 création de l’équation sous forme texte
    const equation = `E = ${slope.toFixed(4)} * A + ${offset.toFixed(4)}`;

    // 📌 désactiver anciennes calibrations
    await Calibration.updateMany({}, { isActive: false });

    // 📌 sauvegarde nouvelle calibration
    const calibration = new Calibration({
      source1,
      source2,
      slope,
      offset,
      equation,
      isActive: true
    });

    await calibration.save();

    // 📌 retour vers controller
    return { slope, offset, equation };
  }
}

module.exports = CalibrationModel;