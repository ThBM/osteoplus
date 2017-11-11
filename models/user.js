const mongoose = require("../config/mongoose")

//Article Schema

let userSchema = mongoose.Schema({
  lastName        : {type: String, require: true},
  firstName        : {type: String, require: true},
  email       : {type: String, require: true},
  username    : {type: String, require: true},
  password    : {type: String, require: true}
})

let User = module.exports = mongoose.model("User", userSchema)
