const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const moment = require("../config/moment")

//models
const Patient = require("../models/patient.js")
const Seance = require("../models/seance.js")


//Middleware pour vérifier que l'utilisateur a bien les droits sur le patient
function checkUserRightsForPatient(req, res, next) {
  Patient.findById(req.params.id, (err, patient) => {
    //if(err) console.log(err)
    if(!patient) {
      req.flash("danger", "Ce patient n'existe pas.")
      res.redirect("/app/patient")
    } else {
      if(!patient.user.equals(req.user._id)) {
        req.flash("danger", "Vous n'avez pas accès à ce patient.")
        res.redirect("/app/patient")
      } else {
        req.middlewareData = {patient: patient}
        next()
      }
    }
  })
}

//Middleware pour vérifier que l'utilisateur a bien les droits sur le patient concernant la séance
function checkUserRightsForPatientSeance(req, res, next) {
  Seance.findById(req.params.id).populate("patient").exec( (err, seance) => {
    //if(err) console.log(err)
    if(!seance) {
      req.flash("danger", "Cette séance n'existe pas.")
      res.redirect("/app/patient")
    } else {
      if(!seance.patient.user.equals(req.user._id)) {
        req.flash("danger", "Vous n'avez pas accès à ce patient.")
        res.redirect("/app/patient")
      } else {
        req.middlewareData = {seance: seance}
        next()
      }
    }
  })
}


//Liste des patients
router.get("/", (req, res) => {
  let query = {
    firstName: new RegExp( (req.query.firstName) ? req.query.firstName : "" , "i"),
    lastName: new RegExp( (req.query.lastName) ? req.query.lastName : "" , "i")
  }

  Patient.findForUser(req.user._id, query, (err, patients) => {
    if(err) console.log(err)
    res.render("app/patient/list", {patients : patients})
  })
})

//Ajouter un patient
router.get("/add", (req, res) => {
  res.render("app/patient/add")
})
router.post("/add", (req, res) => {
  //Validation des données
  req.checkBody("lastName", "Le nom est obligatoire.").not().isEmpty()
  req.checkBody("firstName", "Le prénom est obligatoire.").not().isEmpty()
  let birthday = moment.createFromInput(req.body.birthday)

  const errors = req.validationErrors();
  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.redirect("/app/patient/add")
  } else {
    patient = new Patient({
      user: req.user._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: birthday,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    })

    patient.save( (err) => {
      console.log(err);
      req.flash("success", "Le patient a été ajouté.")
      res.redirect("/app/patient")
    })
  }

})


//Afficher patient
router.get("/:id", checkUserRightsForPatient, (req, res) => {
  let patient = req.middlewareData.patient
  res.render("app/patient/show", {patient: patient})
})

//Modifier un patient
router.post("/:id", checkUserRightsForPatient, (req, res) => {

  let patient = req.middlewareData.patient

  //Validation des données
  req.checkBody("lastName", "Le nom est obligatoire.").not().isEmpty()
  req.checkBody("firstName", "Le prénom est obligatoire.").not().isEmpty()
  let birthday = moment.createFromInput(req.body.birthday)



  const errors = req.validationErrors();
  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.redirect("/app/patient/" + req.params.id)
  } else {
      let newPatient = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthday: birthday,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      }

      let query = {_id: patient._id}

      Patient.update(query, newPatient, (err, patientUpdated) => {
        if(err) {
          console.log(err)
        } else {
          req.flash("success", "La fiche patient a été modifiée.")
          res.redirect("/app/patient/" + patient._id)
        }
      })
  }
})

// Liste des séances pour un patient
router.get("/:id/seance", checkUserRightsForPatient, (req, res) => {
  let patient = req.middlewareData.patient

  Seance.findForPatient(patient._id, {}, (err, seances) => {
    if(err) console.log(err)
    res.render("app/patient/seance/list", {patient : patient, seances: seances})
  })
})

// Ajouter une séance pour un patient
router.get("/:id/seance/add", checkUserRightsForPatient, (req, res) => {
  let patient = req.middlewareData.patient

  res.render("app/patient/seance/add", {patient: patient})
})
router.post("/:id/seance/add", checkUserRightsForPatient, (req, res) => {

  let patient = req.middlewareData.patient

  let startTime = moment.createFromInput(req.body.startDate, req.body.startTime)
  let endTime = moment.createFromInput(req.body.startDate, req.body.endTime)

  console.log(startTime);

  let seance = Seance({
    patient: patient._id,
    startTime: startTime,
    endTime: endTime,
    comments: req.body.comments
  })

  seance.save( (err) => {
    console.log(err);
    req.flash("success", "La séance a été ajoutée.")
    res.redirect("/app/patient/" + patient._id + "/seance")
  })
})

//Afficher une séance
router.get("/seance/:id", checkUserRightsForPatientSeance, (req, res) => {
  let seance = req.middlewareData.seance
  res.render("app/patient/seance/show", {patient: seance.patient, seance: seance})
})

//Modifier une séance
router.post("/seance/:id", checkUserRightsForPatientSeance, (req, res) => {
  let seance = req.middlewareData.seance

  let startTime = moment.createFromInput(req.body.startDate, req.body.startTime)
  let endTime = moment.createFromInput(req.body.startDate, req.body.endTime)

  let newSeance = {
    startTime: startTime,
    endTime: endTime,
    comments: req.body.comments
  }

  let query = {_id: seance._id}

  Seance.update(query, newSeance, (err, seanceUpdated) => {
    if(err) {
      console.log(err)
    } else {
      req.flash("success", "La séance a été modifiée.")
      res.redirect("/app/patient/seance/" + seance._id)
    }
  })
})

module.exports = router
