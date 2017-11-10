const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const moment = require("../config/moment")

//models
const Patient = require("../models/patient.js")
const Seance = require("../models/seance.js")



//Middleware pour vérifier que l'utilisateur est bien connecté.
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  } else {
    req.flash("danger", "Veuillez vous authentifier.")
    res.redirect("/user/login")
  }
}
router.use(ensureAuthenticated)



//Dashboard
router.get("/dashboard", (req, res) => {
  res.render("app/dashboard")
})

//Agenda
router.get("/agenda", (req, res) => {
  Seance.find().populate("patient").exec( (err, seances) => {
    if (err) console.log(err)
    res.render("app/agenda", {seances: seances})
  })
})

let patient = require("./patient")
router.use("/patient", patient)

module.exports = router
