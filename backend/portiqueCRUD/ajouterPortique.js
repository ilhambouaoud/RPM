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