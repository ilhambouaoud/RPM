const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const path = require("path");
const mongoose = require("mongoose");

const Portique = require("../models/Portique");
const Mesure = require("../models/Mesures");

/* ------------------ Generation de PDF ------------------ */

router.get("/report/:portiqueId", async (req, res) => {

  try {

    const { portiqueId } = req.params;

    const portique = await Portique.findById(portiqueId);

    const mesures = await Mesure.find({
      portique_id: new mongoose.Types.ObjectId(portiqueId)
    })
      .sort({ date_mesure: -1 })
      .lean();

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapport-${portiqueId}.pdf`
    );

    doc.pipe(res);

    /* -------- LOGO -------- */

    const logoPath = path.join(__dirname, "../logo.png");

    doc.image(logoPath, 50, 30, { width: 80 });

    doc.moveDown(2);

    /* -------- TITRE -------- */

    doc
      .fontSize(20)
      .text("Rapport de Surveillance Radiologique", {
        align: "center"
      });

    doc.moveDown();

    /* -------- INFOS PORTIQUE -------- */

    doc.fontSize(12);

    doc.text(`Portique : ${portique.nom}`);
    doc.text(`Localisation : ${portique.localisation}`);
    doc.text(`Date du rapport : ${new Date().toLocaleString("fr-FR")}`);

    doc.moveDown();

    /* -------- STATISTIQUES -------- */

    const totalMesures = mesures.length;

    const moyenneCPS =
      totalMesures > 0
        ? mesures.reduce((sum, m) => sum + m.cps, 0) / totalMesures
        : 0;

    const maxCPS =
      totalMesures > 0
        ? Math.max(...mesures.map(m => m.cps))
        : 0;

    const totalAlarmes =
      mesures.filter(m => m.cps > 100).length;

    doc.fontSize(14).text("Statistiques générales");

    doc.fontSize(12);
    doc.text(`Nombre total de mesures : ${totalMesures}`);
    doc.text(`CPS moyen : ${moyenneCPS.toFixed(2)}`);
    doc.text(`CPS maximum : ${maxCPS}`);
    doc.text(`Nombre d'alarmes : ${totalAlarmes}`);

    doc.moveDown();

    /* -------- TABLEAU DES MESURES -------- */

    doc.fontSize(14).text("Liste des mesures collectées");

    doc.moveDown();

    mesures.forEach((m) => {

      const date = new Date(m.date_mesure).toLocaleString("fr-FR");

      doc.text(
        `Date : ${date} | CPS : ${m.cps} | CPM : ${m.cpm} | Tension : ${m.tension}`
      );

    });

    doc.moveDown();

    /* -------- ANALYSE AUTOMATIQUE -------- */

    doc.fontSize(14).text("Analyse radiologique");

    doc.moveDown();

    if (maxCPS > 100) {

      doc
        .fillColor("red")
        .text("ALERTE : Niveau de radiation élevé détecté");

    } else {

      doc
        .fillColor("green")
        .text("Statut : NORMAL - aucune anomalie détectée");

    }

    doc.fillColor("black");

    doc.moveDown(2);

    /* -------- FOOTER -------- */

    doc
      .fontSize(10)
      .text(
        "Rapport généré automatiquement par le système RPM - CNESTEN",
        { align: "center" }
      );

    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).send("Erreur génération rapport");

  }

});

module.exports = router;