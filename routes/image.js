var request = require('request'),
	im = require('imagemagick'),
	path = require('path'),
	nodecr = require('nodecr'),
	async = require('async'),
	request = require('request')

var Topic = require('../models/topic').Topic
/*
	words = require('../static/assets/words.js'),
	spell = require('spell')

var dict = spell()
dict.load(words.words)*/

//*****GENIUS: LOAD IN DICTIONARY, THEN CHECK EACH WORD AND ATTEMPT TO CORRECT (turns out not so genius)

exports.highlight = function(req,res){

	var adjx = 0,
		adjy = 0,
		adjw = 0,
		adjh = 0,
		text = 0

	async.series([
		function(callback){
			im.convert([req.query.src, 'crop.jpg'], 
		    function(err, stdout){
		        if(err)
		        	return callback(err)
		        callback(null)
		    })
		},

		function(callback){
			im.identify('crop.jpg', function(err, features){
				if (err)
					return callback(err)
				console.log(features.width)
				console.log(req.query.imgw)
				adjx = req.query.x * (features.width / req.query.imgw)
				adjy = req.query.y * (features.height / req.query.imgh)
				adjw = req.query.w * (features.width / req.query.imgw)
				adjh = req.query.h * (features.height / req.query.imgh)

			 	callback(null)
			})
		},
		function(callback){
			im.convert([req.query.src, '-crop', adjw + 'x' + adjh + '+' + adjx + '+' + adjy,'crop.jpg'], 
		    function(err, stdout){
		        if(err)
		        	return callback(err)
		    	callback(null)
		    })
		},
		function(callback){
	        nodecr.process(path.resolve(__dirname,'../crop.jpg'),function(err, txt) {
			    if(err)
			        return res.send(500,err)
			    text = txt
			    callback(null)
			})
		}
	],function(err,results){
		console.log(req.query.tid)
		Topic.findOne({_id : req.query.tid}).exec(function(err,topic){
			if(err)
				return res.send(500,"db query err: " + err)
			topic.notes.push({text : text, indent : req.query.indent})
			topic.save(function(err,savedTopic){
				if(err)
					return res.send(500,'db save err: ' + err)
				return res.send(200,{text : text})
			})
		})
	})
}