exports.generateReport = (req, res) => {
  const { portiqueId } = req.params;

  res.send(`Rapport généré pour portique ${portiqueId}`);
};