const LocalStrategy = require("passport-local").Strategy
const User = require("../models/user")
const config = require("../config/database")
const bcrypt = require("bcryptjs")
const passport = require("passport")

module.exports = (passport) => {
  //LocalStrategy

  passport.use(new LocalStrategy( (username, password, done) => {
    let query = {username: username}
    User.findOne(query, (err, user) => {
      if (err) console.log(err)
      if(!user) {
        return done(null, false, {message: "L'utilisateur n'a pas été trouvé."})
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err
        if(isMatch) {
          return done(null, user)
        } else {
          return done(null, false, {message: "Le mot de passe est incorrect."})
        }
      })
    })
  }))


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
