const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit")
const path = require("path")
const Portique = require("./models/Portique")
const app = express();

app.use(cors());
app.use(express.json());

/* ------------------ MongoDB ------------------ */

mongoose.connect("mongodb://127.0.0.1:27017/RPM_Project")
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log(err));

/* ------------------ Routes ------------------ */

// test backend
app.get("/", (req, res) => {
  res.send("Backend RPM fonctionne");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Connexion réussie avec Vue" });
});

/* ------------------ Login ------------------ */

const Utilisateur = require("./models/Utilisateur");

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Utilisateur.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account disabled" });
    }

    if (password !== user.password_hash) {
      return res.status(401).json({ message: "Invalid password" });
    }

    user.last_login = new Date();
    await user.save();

    res.json({
      message: "Login success",
      token: "secure-token",
      role: user.role,
      username: user.username
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------ Utilisateur ------------------ */

// récupérer les infos utilisateur
app.get("/api/me", async (req, res) => {

  try {

    const userId = req.session.userId 

    const user = await Utilisateur.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" })
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email
    })

  } catch (error) {

    res.status(500).json({ message: "Erreur serveur" })

  }

})

/* ------------------ Update utilisateur ------------------ */

app.post("/api/user/update/:id", async (req, res) => {

  const { username, email, password } = req.body

  const updatedUser = await Utilisateur.findByIdAndUpdate(
    req.params.id,
    {
      username,
      email,
      password_hash: password
    },
    { new: true }
  )

  res.json({
    message: "Utilisateur mis à jour",
    user: updatedUser
  })

})


/* ------------------ Mesures ------------------ */


const Mesure = require("./models/Mesures");

// dernière mesure d'un portique


app.get("/api/mesure/latest/:portiqueId", async (req, res) => {

  const { portiqueId } = req.params

  if (!mongoose.Types.ObjectId.isValid(portiqueId)) {
    return res.status(400).json({ message: "ID portique invalide" })
  }

  const mesure = await Mesure.findOne({
  portique_id: new mongoose.Types.ObjectId(portiqueId)
}).sort({ date_mesure: -1 })

  res.json(mesure)

})

// graphique d'un portique
app.get("/api/mesure/chart/:portiqueId", async (req, res) => {

  const { portiqueId } = req.params

  if (!mongoose.Types.ObjectId.isValid(portiqueId)) {
    return res.status(400).json({ message: "ID portique invalide" })
  }

  const mesures = await Mesure.find({
  portique_id: new mongoose.Types.ObjectId(portiqueId)
})
    .sort({ date_mesure: -1 })
    .limit(20)

  res.json(mesures.reverse())

})

/* ------------------ Controle ------------------ */

const Controle = require("./models/Controle");

app.get("/api/controle", async (req, res) => {
  const last = await Controle.findOne().sort({ date: -1 });
  res.json(last);
});

app.post("/api/barriere", async (req, res) => {
  const { state } = req.body;

  const controle = new Controle({
    barriere: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Barrière mise à jour" });
});

app.post("/api/alarme", async (req, res) => {
  const { state } = req.body;

  const controle = new Controle({
    alarme: state,
    date: new Date(),
  });

  await controle.save();

  res.json({ message: "Alarme mise à jour" });
});

/* ------------------ Portiques ------------------ */

app.get("/api/portiques", async (req, res) => {
  try {
    const portiques = await Portique.find();
    res.json(portiques);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* ------------------ Generation de PDF ------------------ */
app.get("/api/report/:portiqueId", async (req, res) => {

  try {

    const { portiqueId } = req.params

    const portique = await Portique.findById(portiqueId)

    const mesures = await Mesure.find({
      portique_id: new mongoose.Types.ObjectId(portiqueId)
    })
    .sort({ date_mesure: -1 })
    .lean()

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapport-${portiqueId}.pdf`
    )

    doc.pipe(res)

    /* -------- LOGO -------- */

    const logoPath = path.join(__dirname, "logo.png")

    doc.image(logoPath, 50, 30, { width: 80 })

    doc.moveDown(2)

    /* -------- TITRE -------- */

    doc
      .fontSize(20)
      .text("Rapport de Surveillance Radiologique", {
        align: "center"
      })

    doc.moveDown()

    /* -------- INFOS PORTIQUE -------- */

    doc.fontSize(12)

    doc.text(`Portique : ${portique.nom}`)
    doc.text(`Localisation : ${portique.localisation}`)
    doc.text(`Date du rapport : ${new Date().toLocaleString("fr-FR")}`)

    doc.moveDown()

    /* -------- STATISTIQUES -------- */

    const totalMesures = mesures.length

    const moyenneCPS =
      totalMesures > 0
        ? mesures.reduce((sum, m) => sum + m.cps, 0) / totalMesures
        : 0

    const maxCPS =
      totalMesures > 0
        ? Math.max(...mesures.map(m => m.cps))
        : 0

    const totalAlarmes =
      mesures.filter(m => m.cps > 100).length

    doc.fontSize(14).text("Statistiques générales")

    doc.fontSize(12)
    doc.text(`Nombre total de mesures : ${totalMesures}`)
    doc.text(`CPS moyen : ${moyenneCPS.toFixed(2)}`)
    doc.text(`CPS maximum : ${maxCPS}`)
    doc.text(`Nombre d'alarmes : ${totalAlarmes}`)

    doc.moveDown()

    /* -------- TABLEAU DES MESURES -------- */

    doc.fontSize(14).text("Liste des mesures collectées")

    doc.moveDown()

    mesures.forEach((m) => {

      const date = new Date(m.date_mesure).toLocaleString("fr-FR")

      doc.text(
        `Date : ${date} | CPS : ${m.cps} | CPM : ${m.cpm} | Tension : ${m.tension}`
      )

    })

    doc.moveDown()

    /* -------- ANALYSE AUTOMATIQUE -------- */

    doc.fontSize(14).text("Analyse radiologique")

    doc.moveDown()

    if (maxCPS > 100) {

      doc
        .fillColor("red")
        .text("ALERTE : Niveau de radiation élevé détecté")

    } else {

      doc
        .fillColor("green")
        .text("Statut : NORMAL - aucune anomalie détectée")

    }

    doc.fillColor("black")

    doc.moveDown(2)

    /* -------- FOOTER -------- */

    doc
      .fontSize(10)
      .text(
        "Rapport généré automatiquement par le système RPM - CNESTEN",
        { align: "center" }
      )

    doc.end()

  } catch (error) {

    console.error(error)

    res.status(500).send("Erreur génération rapport")

  }

})


/* ------------------ Ajouter Portique ------------------ */

app.post("/api/portiques", async (req, res) => {

  try {

    const portique = new Portique({
      nom: req.body.nom,
      localisation: req.body.localisation,
      etat: req.body.etat,
      tension_actuelle: req.body.tension_actuelle,
      date_maintenance: req.body.date_maintenance
    })

    await portique.save()

    res.json({
      message: "Portique ajouté avec succès",
      portique
    })

  } catch (error) {

    console.error(error)
    res.status(500).json({ error: "Erreur ajout portique" })

  }

})


app.get("/api/portiques/:id", async (req, res) => {
  try {

    const portique = await Portique.findById(req.params.id)

    if (!portique) {
      return res.status(404).json({ message: "Portique non trouvé" })
    }

    res.json(portique)

  } catch (error) {

    res.status(500).json({ message: "Erreur serveur" })

  }
})



/* ------------------ Start Server ------------------ */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


