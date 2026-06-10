const ModeNormale = require("../models/ModeNormale");
const ModeBalayage = require("../models/ModeBalayage");

const { decrypt } = require("../utils/crypto");

// ================= MODE NORMAL =================

exports.getNormalHistory = async (req, res) => {

  try {

    const sessions = await ModeNormale.find()
      .sort({ date_creation: -1 });

    const result = sessions.map(session => {

      const valeurs = session.mesures.map(m => {

        try {
          return Number(decrypt(m.value));
        } catch {
          return 0;
        }

      });

      const moyenne =
        valeurs.length > 0
          ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length
          : 0;

      return {
        _id: session._id,
        date_creation: session.date_creation,
        mode_mesure: session.mode_mesure,
        LLD: session.LLD,
        HLD: session.HLD,
        HT: session.HT,
        nombreMesures: session.mesures.length,
        moyenne: Number(moyenne.toFixed(2))
      };
    });

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erreur récupération historique normal"
    });

  }

};

// ================= DETAIL MODE NORMAL =================

exports.getNormalDetails = async (req, res) => {

  try {

    const session = await ModeNormale.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        error: "Session introuvable"
      });
    }

    const mesures = session.mesures.map(m => ({

      timestamp: m.timestamp,

      value: (() => {
        try {
          return decrypt(m.value);
        } catch {
          return m.value;
        }
      })()

    }));

    res.json({
      session,
      mesures
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erreur détails session"
    });

  }

};

// ================= MODE BALAYAGE =================

exports.getBalayageHistory = async (req, res) => {

  try {

    const sessions = await ModeBalayage.find()
      .sort({ date_creation: -1 });

    const result = sessions.map(session => {

      const valeurs = session.points.map(p => {

        try {
          return Number(decrypt(p.cps));
        } catch {
          return 0;
        }

      });

      const moyenne =
        valeurs.length > 0
          ? valeurs.reduce((a, b) => a + b, 0) / valeurs.length
          : 0;

      return {
        _id: session._id,
        date_creation: session.date_creation,
        LLD_depart: session.LLD_depart,
        dV: session.dV,
        Vmax: session.Vmax,
        nombrePoints: session.points.length,
        moyenne: Number(moyenne.toFixed(2))
      };
    });

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erreur historique balayage"
    });

  }

};

// ================= DETAIL BALAYAGE =================

exports.getBalayageDetails = async (req, res) => {

  try {

    const session = await ModeBalayage.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        error: "Session introuvable"
      });
    }

    const points = session.points.map(p => ({

      tension: p.tension,

      cps: (() => {
        try {
          return decrypt(p.cps);
        } catch {
          return p.cps;
        }
      })()

    }));

    res.json({
      session,
      points
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erreur détails balayage"
    });

  }

};