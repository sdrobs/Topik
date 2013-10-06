var express = require('express'),
path = require('path'),
mongo = require('mongodb'),
mongoose = require('mongoose'),
engines = require('consolidate'),
MongoStore = require('connect-mongo')(express),
settings = require('./settings.js')

var mongoSetup = false
var mongoUri = settings.mongouri

exports.expressConfig = function(app,callback){
    app.use(express.limit('10kb'))
    app.enable('trust proxy')

    app.use('/app', express.static(__dirname + '/static'))
    app.engine('html', engines.mustache)
    app.set('view engine', 'html')
    app.use(express.bodyParser())

    app.use(express.cookieParser())
    app.use(express.session({
        key     : 'sid',
        secret  : settings.sessionsecret,
        expires : new Date(Date.now() + 7 * 24 * 60 * 60),
        store   : new MongoStore({
            url  : mongoUri
        })
    }))

        callback(null)
    }

exports.connectMongo = function (callback) {
    if (mongoSetup)
        return callback(null)

    mongoSetup = true

    mongoose.connect(mongoUri, function(err) {
        if (err)
            return callback(err)
        console.log('Connected to Mongoose')

        mongo.connect(mongoUri, {db : {safe : true}}, function(err, connectedDb) {
            console.log('Connected to Mongo')
            exports.mongo = connectedDb
            callback(err)
        })
    })
}