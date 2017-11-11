const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const passport = require("passport")
const moment = require("../config/moment")

//models
const User = require("../models/user.js")

//Split name into first and last name for existing users
/*router.get("/changeUsersNames", function(req, res) {
  User.find().exec( (err, users) => {
    users.forEach((user) => {
      let split = user.lastName.split(" ")

      let newUser = {
        firstName: split[0],
        lastName: split[1]
      }

      User.update({_id: user._id}, newUser, (err, newUser) => {
        if(err) console.log(err);
        console.log(newUser);
      })
      console.log(user);
    })

    User.update({}, {$unset : {name: 1}}, (err, res) => {
      console.log(err, res);
    })
    console.log(users);
    res.send("see log")
  })
})*/


module.exports = router
