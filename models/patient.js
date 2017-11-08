const mongoose = require("../config/mongoose")

//Patient Schema

let patientSchema = mongoose.Schema({
  user       : {type: mongoose.Schema.ObjectId, ref: "User", require: true},
  firstName  : {type: String, require: true},
  lastName   : {type: String, require: true},
  birthday   : {type: "Moment", require: true}, //Date
  email      : {type: String, require: true},
  phone      : {type: String, require: true},
  address    : {type: String, require: true}
})

patientSchema.statics.findForUser = function(userId, query, callback) {
  query.user = userId
  return this.find(query, callback)
}

let Patient = mongoose.model("Patient", patientSchema)





module.exports = Patient
