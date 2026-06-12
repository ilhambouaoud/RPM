const ModeBalayage = require("../models/ModeBalayage");
const CalibrationService = require("../services/calibrationService");

// 📌 ajoute un point enrichi (tension + CPS + énergie)
exports.addScanPoint = async (tension, cps, sessionId) => {

  try {

    // 📌 1. conversion tension → énergie
    const energy = await CalibrationService.convertAmplitudeToEnergy(tension);

    // 📌 2. sauvegarde en base
    await ModeBalayage.findByIdAndUpdate(sessionId, {

      $push: {
        points: {
          tension,  // X physique
          cps,      // fréquence
          energy    // Y physique enrichi
        }
      }

    });

    // 📌 retour pour debug
    return { tension, cps, energy };

  } catch (err) {
    console.error("Erreur scanController:", err.message);
  }
};