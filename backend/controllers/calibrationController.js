const CalibrationModel = require("../models/calibrationModel");

// 📌 API : reçoit données du frontend calibration
const calculateCalibration = async (req, res) => {

  try {

    // 📌 données envoyées par l’interface web
    const { source1, source2 } = req.body;

    // 📌 appel du modèle métier
    const result = await CalibrationModel.calculateAndSave(source1, source2);

    // 📌 réponse au frontend
    res.json(result);

  } catch (error) {

    // 📌 gestion erreur serveur
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  calculateCalibration
};