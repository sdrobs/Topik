var path = require('path'),
	mongoose = require('mongoose')
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId

//models
var Topic = require('../models/topic').Topic

var views = {
	'topic'	: {view:'../static/views/topic-view.html'} //main != home
}

var scripts = {
	'main-view'	: '../static/js/scripts/main-view.js'
}

exports.renderView = function(req,res){

	if(typeof views[req.view_path] === 'undefined')
		return res.end('<!--No View Found-->')

    if(typeof req.view_path !== 'undefined' && typeof views[req.view_path] !== 'undefined'){
		return res.sendfile(path.resolve(__dirname,views[req.view_path].view))
	}
}

exports.renderScript = function(req,res){
	if(typeof scripts[req.script_path] === 'undefined')
		return res.sendfile(path.resolve(__dirname,'../static/js/scripts/no-view-found.js'))

	if(typeof req.script_path !== 'undefined' && typeof scripts[req.script_path] !== 'undefined')
		return res.sendfile(path.resolve(__dirname,scripts[req.script_path]))
}

exports.renderMain = function(req,res){
	Topic.find({user : req.session.user_id}).exec(function(err,topics){
		if(err)
			return res.send(500,'db query error')
		else
			res.render('../static/views/main.html', {topics : topics})
	})
}

//return res.sendfile(path.resolve(__dirname,'./static/views/main.html'))