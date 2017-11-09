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

//Middleware pour vérifier que l'utilisateur a bien les droits sur le patient
function checkUserRightsForPatient(req, res, next) {
  Patient.findById(req.params.id, (err, patient) => {
    if(err) console.log(err)
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

// Dashboard
router.get("/dashboard", (req, res) => {
  res.render("app/dashboard")
})

//Liste des patients
router.get("/patient", (req, res) => {
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
router.get("/patient/add", (req, res) => {
  res.render("app/patient/add")
})
router.post("/patient/add", (req, res) => {
  //Validation des données
  req.checkBody("lastName", "Le nom est obligatoire.").not().isEmpty()
  req.checkBody("firstName", "Le prénom est obligatoire.").not().isEmpty()
  let birthday = moment(dateValidation(req.body.birthday))

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
      birthday: birthday.isValid() ? birthday : null,
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
router.get("/patient/:id", checkUserRightsForPatient, (req, res) => {
  let patient = req.middlewareData.patient
  res.render("app/patient/show", {patient: patient})
})

//Modifier un patient
router.post("/patient/:id", checkUserRightsForPatient, (req, res) => {

  let patient = req.middlewareData.patient

  //Validation des données
  req.checkBody("lastName", "Le nom est obligatoire.").not().isEmpty()
  req.checkBody("firstName", "Le prénom est obligatoire.").not().isEmpty()
  let birthday = moment(dateValidation(req.body.birthday))
  console.log(birthday);


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
        birthday: birthday.isValid() ? birthday : null,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
      }

      let query = {_id: patient._id}

      Patient.update(query, newPatient, (err, patient) => {
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
router.get("/patient/:id/seance", checkUserRightsForPatient, (req, res) => {
  let patient = req.middlewareData.patient
  Seance.findForPatient(patient._id, (err, seances) => {
    if(err) console.log(err)
    res.render("app/patient/seance/list", {patient : patient, seances: seances})
  })
})

// Ajouter une séance pour un patient
router.get("/patient/:id/seance/add", checkUserRightsForPatient, (req, res) => {

  let patient = req.middlewareData.patient

  let seance = Seance({
    patient: patient._id,
    startTime: moment(),
    endTime: moment(),
    comments: "Commentaire test"
  })

  seance.save( (err) => {
    console.log(err);
    req.flash("success", "La séance a été ajoutée.")
    res.redirect("/app/patient/" + patient._id + "/seance")
  })
})



//Formatage de la date donnée en input
function dateValidation(value) {
  let split = value.split(/\//);
		if(value.match(/^[0-3]?[0-9]\/[0-1]?[0-9]\/[0-9]{4}$/))
			return split[2]+'-'+split[1]+'-'+split[0];
		else if(value.match(/^[0-3]?[0-9]\/[0-1]?[0-9]\/[0-9]{2}$/))
			return '20'+split[2]+'-'+split[1]+'-'+split[0];
		else if(value.match(/^[0-3]?[0-9]\/[0-1]?[0-9]$/))  {
      let date = new Date()
			return date.getFullYear()+'-'+split[1]+'-'+split[0];
    }
		else
			return null;
}


module.exports = router
