const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")

//Model Article
let User = require("../models/user")





//User register form
router.get("/register", (req, res) => {
  res.render("user/register")
})

router.post("/register", (req, res) => {

  req.checkBody("firstName", "Le prénom est obligatoire.").not().isEmpty()
  req.checkBody("lastName", "Le nom est obligatoire.").not().isEmpty()
  req.checkBody("email", "L'Email est obligatoire.").not().isEmpty()
  req.checkBody("email", "L'Email n'est pas valide.").isEmail()
  req.checkBody("username", "Le nom d'utilisateur est obligatoire.").not().isEmpty()
  req.checkBody("password", "Le mot de passe est obligatoire.").not().isEmpty()
  req.checkBody("password2", "Les mots de passe ne correspondent pas.").equals(req.body.password)

  let errors = req.validationErrors()


  if (errors) {
    for (let error of errors) {
      req.flash("danger", error.msg)
    }
    res.render("user/register", {postValues: req.body})
  } else {

    User.findOne({username: req.body.username}, (err, user) => {
      if(err) console.log(err);
      if(user) {
        req.flash("danger", "Le nom d'utilisateur existe déjà.")
        res.render("user/register", {postValues: req.body})
      } else {
        let newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          username: req.body.username,
          password: req.body.password
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) {
              console.log(err)
            } else {
              newUser.password = hash
              newUser.save( (err) => {
                req.flash("success", "Vous êtes inscrit. Vous pouvez vous connecter.")
                res.redirect("/user/login")
              })
            }
          })
        })
      }
    })
  }
})

router.get("/login", (req, res) => {
  res.render("user/login")
})
router.post("/login", (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: "/app/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true
  })(req, res, next)
})

router.get("/logout", (req, res) => {
  req.logout()
  req.flash("success", "Vous êtes déconnecté.")
  res.redirect("/user/login")
})



module.exports = router
