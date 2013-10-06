var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId


var Topic = new Schema({
    title                   : { type : String, required : true, index: true },
    notes: [{
        text             	: { type : String },
        indent        	 	: { type : Number, default : 0}
    }],
    user					: { type : ObjectId, ref: 'User', required : true,  index: true},
    keyterms				: [{ type : String}]
})


exports.Topic = mongoose.model('Topic', Topic)
exports.Schema = Topic