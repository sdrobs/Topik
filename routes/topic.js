var mongoose = require('mongoose'),
	Topic = require('../models/topic').Topic

exports.getTopic = function(req,res){
	if(!req.query.id)
		return res.send(400,"invalid params")
	Topic.findOne({_id : req.query.id}).exec(function(err,topic){
		if(err)
			return res.send(500, "db query err: " + err)
		return res.send(200,topic)
	})
}

exports.newTopic = function(req,res){
	if(!req.body.title || req.body.title.length > 300)
		return res.send(400,"invalid parameters")
	var topic = new Topic()
	topic.title = req.body.title
	topic.user = req.session.user_id
	topic.save(function(err,topic){
		if(err)
			return res.send(500,"db save error")
		return res.send(200,topic)
	})

}