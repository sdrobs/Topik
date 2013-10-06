var mongoose = require('mongoose'),
	User = require('../models/user').User,
	bcrypt = require('bcrypt')

exports.login = function(req,res){
	if(!req.body || !req.body.email || !req.body.password)
		return res.send(400,'invalid parameters')

	User.findOne({email : req.body.email}).exec(function(err,user){
		if(err)
			return res.send(500,'db query err' + err)

		if(user && user.password){ //user exists
			bcrypt.compare(req.body.password, user.password, function(err, same) {
			    if(same){
			    	req.session.user = user.email
			    	req.session.user_id = user._id

			    	return res.send(200,{login_success : true})
			    }
			    else{
			    	return res.send(200,{login_success : false})
			    }
			})
		}
		else{ //new account
			var user = new User()
			user.email = req.body.email

			bcrypt.genSalt(10, function(err, salt) {
			    bcrypt.hash(req.body.password, salt, function(err, hash) {
			        user.password = hash

        			user.save(function(err,results){
						if(err)
							return res.send(500,'db save err' + err)
						else{
							req.session.user = user.email
							req.session.user_id = results._id
							return res.send(200,{login_success : true})
						}
					})
			    })
			})
		}
	})
}