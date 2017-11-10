const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const moment = require("../config/moment")

//models
const User = require("../models/user.js")

//Afficher le profil
router.get("/", (req, res) => {
  res.render("app/user/show", {user: req.user})
})

//Modifier le profil
router.post("/", (req, res) => {
  //Validation des données
  req.checkBody("name", "Le nom est obligatoire.").not().isEmpty()

  const errors = req.validationErrors();
  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.redirect("/app/user")
  } else {
    let newUser = {
      name: req.body.name,
      email: req.body.email
    }

    let query = {_id: req.user._id}

    User.update(query, newUser, (err, userUpdated) => {
      if(err) {
        console.log(err)
      } else {
        req.flash("success", "Votre profil a été modifiée.")
        res.redirect("/app/user")
      }
    })
  }
})

//Modifier le mot de passe
router.get("/password", (req, res) => {
  res.render("app/user/password", {user: req.user})
})
router.post("/password", (req, res) => {
  bcrypt.compare(req.body.password, req.user.password, (err, match) => {
    if(err) console.log(err);
    if(!match) {
      req.flash("danger", "Le mot de passe actuel est incorrect.")
      res.redirect("/app/user/password")
    } else {
      //validationErrors
      req.checkBody("newPassword", "Le mot de passe doit contenir au moins 6 charactères.").isLength({ min: 6 })
      req.checkBody("newPassword", "Les mots de passe ne correspondent pas.").equals(req.body.newPassword2)
      const errors = req.validationErrors();
      if (errors) {
        for (let error of errors) {
          req.flash("danger", error.msg)
        }
        res.redirect("/app/user/password")
      } else {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
            let newUser = {password: hash}

            let query = {_id: req.user._id}

            User.update(query, newUser, (err, userUpdated) => {
              if(err) {
                console.log(err)
              } else {
                req.flash("success", "Votre mot de passe a été modifié.")
                res.redirect("/app/user/password")
              }
            })
          })
        })
      }
    }
  })

})
module.exports = router
