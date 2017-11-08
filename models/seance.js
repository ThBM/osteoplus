const mongoose = require("../config/mongoose")

//Seance Schema

let seanceSchema = mongoose.Schema({
  patient    : {type: mongoose.Schema.Types.ObjectId, ref: "Patient", require: true},
  startTime  : {type: "Moment", require: true},
  endTime    : {type: "Moment", require: true}
})

seanceSchema.statics.findForUser = function(patientId, query, callback) {
  query.patient = patientId
  return this.find(query, callback)
}

let Seance = mongoose.model("Seance", seanceSchema)

module.exports = Seance
