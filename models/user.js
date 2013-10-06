var mongoose = require('mongoose')

var Schema = mongoose.Schema


var User = new Schema({
    email                      : { type : String, required : true, index: true },
    password                   : { type : String, required : true }
})


exports.User = mongoose.model('User', User)
exports.Schema = User