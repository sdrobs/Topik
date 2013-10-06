var express = require('express'),
    setup = require('./setup'),
    async = require('async'),
    path = require('path'),
    http = require('http'),
    settings = require('./settings.js'),
    im = require('imagemagick')

//routes
var Router = require('./routes/router'),
    UserRoutes = require('./routes/user'),
    ImageRoutes = require('./routes/image'),
    TopicRoutes = require('./routes/topic')

async.series(
    {
        /*
        test:function(callback){
            im.convert(['-verbose', '-density', '400', '-trim', 'test.pdf', 'abc.jpg'], 
            function(err, stdout){
                console.log('msg')
            })

            // convert INFILE.png -set Title "foobar the great" OUTFILE.png
        },
        */

        addPrototypes: function(callback){
            String.prototype.descapeHex = function() {
                return this.replace(/\\x([0-9A-Fa-f]{2})/g, function() {
                    return String.fromCharCode(parseInt(arguments[1], 16));
                });
            }

            String.prototype.descapeAscii = function() {
                return this.replace( /&#([0-9]{1,7});/g, function( g, m1 ){
                    return String.fromCharCode( parseInt( m1, 10 ) );
                }).replace( /&#[xX]([0-9a-fA-F]{1,6});/g, function( g, m1 ){
                    return String.fromCharCode( parseInt( m1, 16 ) );
                })
            }


            callback(null)
        },

        expressConfig: function(callback){
            app = express()
            setup.expressConfig(app,function(err){
                if(err)
                    return callback(err)
                callback(null)
            })
        },

        mongoConnect: function(callback){
            setup.connectMongo(function(err){
                if(err)
                    return callback(err)
                callback(null)
            })
        },

        middleware: function(callback){

            app.all('*',function(req, res, next){
                console.log(req.url)
                if(req.url !== '/route/login' && (typeof req.session.user === 'undefined' || req.session.user.length < 1))
                    return res.sendfile(path.resolve(__dirname,'./static/views/home.html'))
                next()
            })

            app.param('viewPath', function(req, res, next, path) {
                //do validation for path here
                req.view_path = path

                next()
            })

            app.param('scriptPath', function(req, res, next, path) {
                //do validation for path here
                req.script_path = path

                next()
            })

            callback(null)
        },

        routes: function(callback){

            app.get('/favicon.ico',function(req,res){res.end()})

            app.post('/route/login',UserRoutes.login)
            app.post('/route/new_topic',TopicRoutes.newTopic)
            app.get('/route/topic', TopicRoutes.getTopic)
            app.get('/route/imghighlight',ImageRoutes.highlight)

            app.get('/route/article',Router.getArticle)

            app.post('/route/add_note',TopicRoutes.addNote)

            app.get('/view/:viewPath', Router.renderView)
            app.get('/script/:scriptPath', Router.renderScript)

            app.get(/^(?!\/app\/).+/, function(req,res){
                if(req.url.substring(0,5) === '/app/')
                    return next()
                Router.renderMain(req,res)
            })

            callback(null)
        },

        startApp: function(callback){
            var port = process.env.PORT || 7777
            var server = http.createServer(app)

            server.listen(port, function() {
              console.log("Listening on " + port);
            })

            callback(null)
        }
    },
    function(err){
        console.log('App Started...')
    }
)