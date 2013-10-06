require.config({

    paths: {
        'async'     : 'plugins/async',
        'jquery'    : 'plugins/jquery-1.10.2.min',
        'bootstrap' : 'plugins/bootstrap/js/bootstrap.min',
        'render'    : 'scripts/render',
        'moment'    : 'plugins/moment',
        'less'      : 'plugins/less-1.4.1.min',
        'mustache'  : 'plugins/mustache',
        'prettify'  : 'plugins/prettify/prettify',
        'rickshaw'  : 'plugins/rickshaw.min',
        'socketio'  : '/socket.io/socket.io'
    },

    shim: {
        'bootstrap': { deps: ['jquery'] },
        'render'   : { deps: ['jquery'] }
    }

})

require(['async','mustache','moment','jquery','bootstrap','less','render','prettify'], function(async,mustache,angler,moment) {
    this.async = async
    this.mustache = mustache
    this.moment = moment
})