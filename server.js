const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const session = require("express-session")
const flash = require("connect-flash")
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const config = require("./config/database")
const passport = require("passport")


mongoose.connect(config.database)
let db = mongoose.connection

//Check db connection
db.once("open", () => {
  console.log("Connected to mongodb");
})
//Check db error
db.on("error", (err) => {
  console.log(err)
})



//Init server
const server = express()


//Bring in models
//...

//Middleware

  //body-parser
server.use(bodyParser.urlencoded({ extended: false}))
server.use(bodyParser.json())

  //express-session
server.use(session({
  secret: "ie3dc2c",
  resave: false,
  saveUninitialized: true,
  cookie: { secure : false }
}))

  //express-messages
server.use(require("connect-flash")())
server.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next()
})

  //express-validation No Middleware required as it is V4
server.use(require('express-validator')())

  //Passport LocalStrategy
require("./config/passport")(passport)
server.use(passport.initialize());
server.use(passport.session());

server.get("*", (req, res, next) => {
  res.locals.user = req.user || null
  next()
})

//Set Public folder
server.use(express.static(path.join(__dirname, 'public')))




//Load view engine
server.set("views", path.join(__dirname, "views"))
server.set("view engine", "pug")


//Routes
server.get("/", (req, res) => {
  if(!req.user) {
    res.redirect("/user/login")
  } else {
    res.render("index")
  }
})

//Include routes
  //Site internet ??

  //Gestion des utilisateurs
let user = require("./routes/user")
server.use("/user", user)

  //Gestion de l'application
let app = require("./routes/app")
server.use("/app", app)






server.listen(3000, function() {
  console.log("Server started on port 3001")
})
