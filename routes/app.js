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

  let currentYear = moment().format("YYYY")
  let lastYear = moment().subtract(1, "years").format("YYYY")

  Seance.find({
    startTime: {
      $lte: moment(),
      $gte: moment(lastYear)
    }
  }).populate("patient").exec( (err, seances) => {
    if (err) console.log(err)

    let seancesForUser = seances.filter( seance => seance.patient.user.equals(req.user._id) )

    var seancesByMonth = seancesForUser.reduce((a, b) => {
      var year = b.startTime.format("YYYY") == currentYear ? "currentYear" : "lastYear"
      var month = b.startTime.format("MMMM")
      if (!a.hasOwnProperty(year)) {
        a[year] = [];
        a[year][month] = 0
      } else if(!a[year].hasOwnProperty(month)) {
        a[year][month] = 0
      }
      a[year][month]++;
      return a;
    }, {});

    let data = [
      ["Janvier", seancesByMonth.lastYear["janvier"], seancesByMonth.currentYear["janvier"]],
      ["Février", seancesByMonth.lastYear["février"], seancesByMonth.currentYear["février"]],
      ["Mars", seancesByMonth.lastYear["mars"], seancesByMonth.currentYear["mars"]],
      ["Avril", seancesByMonth.lastYear["avril"], seancesByMonth.currentYear["avril"]],
      ["Mai", seancesByMonth.lastYear["mai"], seancesByMonth.currentYear["mai"]],
      ["Juin", seancesByMonth.lastYear["juin"], seancesByMonth.currentYear["juin"]],
      ["Juillet", seancesByMonth.lastYear["juillet"], seancesByMonth.currentYear["juillet"]],
      ["Août", seancesByMonth.lastYear["août"], seancesByMonth.currentYear["août"]],
      ["Septembre", seancesByMonth.lastYear["septembre"], seancesByMonth.currentYear["septembre"]],
      ["Octobre", seancesByMonth.lastYear["octobre"], seancesByMonth.currentYear["octobre"]],
      ["Novembre", seancesByMonth.lastYear["novembre"], seancesByMonth.currentYear["novembre"]],
      ["Décembre", seancesByMonth.lastYear["décembre"], seancesByMonth.currentYear["décembre"]]
    ]


    //res.render("app/agenda", { events: JSON.stringify(eventsForUser) })
    res.render("app/dashboard", {data: JSON.stringify(data)})
  })
})

//Agenda
router.get("/agenda", (req, res) => {
  Seance.find().populate("patient").exec( (err, seances) => {
    if (err) console.log(err)

    let eventsForUser = seances.filter(
      seance => seance.patient.user.equals(req.user._id)
    ).map( (obj) => {
        return {
          title: obj.patient.lastName + " " + obj.patient.firstName,
          start: obj.startTime,
          end: obj.endTime,
          seanceId: obj._id
        }
    })
    res.render("app/agenda", { events: JSON.stringify(eventsForUser) })
  })
})

//Modifier une séance depuis l'agenda (Ajax Request)
router.post("/agenda/seance", (req, res) => {
  Seance.findById(req.body.id).populate("patient").exec( (err, seance) => {
    if(err) res.staus(500).send("Une erreur s'est produite lors de la recherche de la séance.")
    if(!seance) {
      res.status(404).send("La séance n'existe pas.")
    } else {
      if(!seance.patient.user.equals(req.user._id)) {
        res.status(401).send("Vous n'avez pas accès à ce patient.")
      } else {
        console.log(req.body.startTime);

        let startTime = moment(req.body.startTime)
        let endTime = moment(req.body.endTime)

        if(startTime > endTime) {
          endTime = startTime.clone()
          endTime.add(15, "m")
        }

        let newSeance = {
          startTime: startTime,
          endTime: endTime
        }

        let query = {_id: seance._id}

        Seance.update(query, newSeance, (err, seanceUpdated) => {
          if(err) {
            res.staus(500).send("Une erreur s'est produite lors de la mise à jour.")
          } else {
            res.send("La séance a été modifiée.")
          }
        })
      }
    }
  })
})



let patient = require("./app-patient")
router.use("/patient", patient)

let user = require("./app-user")
router.use("/user", user)

module.exports = router
