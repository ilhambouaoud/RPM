module.exports = (req, res, next) => {

  console.log("SESSION =", req.session)

  if (!req.session.userId) {

    return res.status(401).json({
      message: "Non authentifié"
    })

  }

  next()

}