
(function(){

    var rendify = {}
    var root = this //window

    rendify.currentTopic = ""

    var render = function(container,view,callback,data){
        if(!container || !view)
            return callback('Error rendering view')

        $.get('/view/' + view, function(html) {
            if(data)
                html = mustache.to_html(html,data)

            $(container).empty().html(html)

            callback(null)
        })
    }

    rendify.render = render

    var renderScript = function(viewPath,callback){

        var path = viewPath || (window.location.pathname+window.location.search).toLowerCase()

        if(path === '/')
            path = 'home'
        if(path[0] === '/')
            path = path.substring(1,path.length)

        $('.construction').addClass('hide')

        $.ajax({
            type: 'GET',
            url: '/script/' + path,
            success: function(data) {

                if(typeof data === 'undefined' || data.length === 0)
                    return callback('No js Found')
                callback(null)
            },
            error: function(jqXHR) {
                return callback(jqXHR.responseText)
            }
        })
    }

    rendify.renderScript = renderScript

    var colorTransition = function(element,property){
        var time = 20
        var max = 256
        var min = 128
        var active = 'green'
        var isUp = true

        var colors = {
            red : {val:128,next:'blue'},
            green : {val:200,next:'red'},
            blue : {val:256,next:'green'}
        }

        if(rendify.colorTimer)
            clearInterval(rendify.colorTimer)

        rendify.colorTimer = window.setInterval(function(){
            //console.log('rgb(' + colors['red'].val + ',' + colors['green'].val + ',' + colors['blue'].val + ')')
            if(isUp){
                if(colors[active].val >= max){
                    isUp = !isUp
                    active = colors[active].next
                    return
                }

                colors[active].val += 1
            }
            else{
                if(colors[active].val <= min){
                    isUp = !isUp
                    active = colors[active].next
                    return
                }

                colors[active].val -= 1
            }

            if(property instanceof Array){
                property.forEach(function(prop){
                    $(element).css(prop,'rgb(' + colors['red'].val + ',' + colors['green'].val + ',' + colors['blue'].val + ')')
                })
            }
            else{
                $(element).css(property,'rgb(' + colors['red'].val + ',' + colors['green'].val + ',' + colors['blue'].val + ')')
            }

        },time)
    }

    rendify.color = colorTransition

    //
    //hooks

    /*
    root.onpopstate = function(){
        rendify.renderScript(null,function(){
        })
    }*/


    $('a').click(function(e){
        var path = $(this).attr('href')

        history.pushState({path : path},'',path)

        rendify.renderScript(null,function(){
        })

        return false
    })

    function addTopicHook(){
        $('.topic-block').unbind('click')
        $('.topic-block').click(function(e){
            $('.text-actions').hide()
            $('.img-actions').hide()
            $('.link-actions').hide()

            $.ajax({
                type: 'GET',
                url: '/route/topic',
                data: {
                    id : e.target.dataset.id
                },
                success: function(data) {
                    rendify.render('.view-container','topic',function(){
                        rendify.currentTopic = e.target.dataset.id

                        $('.topic-notes').each(function(i,e){
                            for(var i = 0; i < $(e).data('indent'); i++){
                                $(e).css('font-size','-=4')
                                $(e).find('i').css('font-size','-=2')
                                $(e).css('padding-left','+=30px')
                            }
                        })

                        $('.action-panel').animate({'width': '51px'},1000)

                        $('.topic-notes').unbind('keyup')
                        $('.topic-notes').keyup(function(){
                            console.log('msg')
                        })
                    },data)
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        })
    }
    addTopicHook()

    $('.login-btn').click(function(e){
        if($('#email').val() === "email" && $('#password').val() === "password"){
            $('.login').slideDown(1000)
        }
        else{
            $.ajax({
                type: 'POST',
                url: '/route/login',
                data: {
                    email : $('#email').val(),
                    password : $('#password').val()
                },
                success: function(data) {
                    if(data.login_success)
                        location.reload()
                    else
                        $('#warning').show()
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        }
    })

    $('#email').mousedown(function(){
        if($(this).val() == 'email')
            $(this).val('')
    })

    $('#email').blur(function(){
        if($(this).val() == '')
            $(this).val('email')
    })

    $('#password').mousedown(function(){
        if ($(this).val() == 'password'){
            $(this).val('')
            $(this).attr('type','password')
        }
    })

    $('#password').blur(function(){
        if($(this).val() == ''){
            $(this).val('password')
            $(this).attr('type','text')
        }
    })

    $('.img').mousedown(function(e){
        var x = e.pageX - $('.img').offset().left
        var y = e.pageY - $('.img').offset().top
        $('.hl').css('left', e.pageX)
        $('.hl').css('top', e.pageY)
        $('.hl').show()
        //alert(e.pageY - $('.img').offset().top)

        $(window).mousemove(function(e){
            $('.hl').css('width', e.pageX - $('.hl').position().left)
            $('.hl').css('height',e.pageY - $('.hl').position().top)
        })

        $('.img').mouseup(function(e){
            $(this).unbind('mouseup')
            $(window).unbind('mousemove')
            $('.hl').hide()
            $('.hl').removeAttr('style')

            var indent = 0
            if(e.shiftKey)
                indent = 1


            var w = e.pageX - $('.img').offset().left - x
            var h = e.pageY - $('.img').offset().top - y

            $.ajax({
                type: 'GET',
                url: '/route/imghighlight',
                data: {
                    x: x,
                    y: y,
                    w: w,
                    h: h,
                    src: $(e.target).attr('src'),
                    imgw: $(this).width(),
                    imgh: $(this).height(),
                    tid: rendify.currentTopic,
                    indent: indent
                },
                success: function(data) {
                    console.log(data.text)
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        })
        return false
    })

    $('.add-topic').click(function(){
        if($('.new-topic').height() == 0)
            $('.new-topic').animate({'height':'70px'},1000)
        else{
            if($('#new-topic-input').val() !== ''){
                $.ajax({
                    type: 'POST',
                    url: '/route/new_topic',
                    data: {
                        title: $('#new-topic-input').val()
                    },
                    success: function(data) {
                        $('.left-bar').prepend('<div class="topic-block" data-id='+ data._id +'>'+ data.title +'</div>') //has been sanitized by server already
                        addTopicHook()
                    },
                    error: function(jqXHR) {
                         console.log(jqXHR.responseText)
                    }
                })
            }
            else
                $('.new-topic').animate({'height':'0px'},1000)
        }
    })

    $('#pichl').click(function(e){
        $('.img-actions').show()
        $('.action-panel').animate({'width': $(window).width() - 220},1000)
    })

    $('#text').click(function(e){
        $('.text-actions').show()
        $('.action-panel').animate({'width': $(window).width() - 220},1000)
    })

    $('#link').click(function(e){
        $('.link-actions').show()
        $('.action-panel').animate({'width': $(window).width() - 220},1000)
    })

    function getSelection() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            var text = sel.extentNode.data.substring(sel.baseOffset,sel.extentOffset)
            return text
        }
    }

    var globalTimeout
    $('#img-url').mousedown(function(){
        if($(this).val() == $(this).attr('value'))
            $(this).val('')
    }).keydown(function(){
        if(globalTimeout){
            clearInterval(globalTimeout)
        }
        globalTimeout = setTimeout(function(){
            $('.img').attr('src',$('#img-url').val())
            $('.img').show()
        },2000)
    })

    var pageGlobalTimeout
    $('#page-url').mousedown(function(){
        if($(this).val() == $(this).attr('value'))
            $(this).val('')
    }).keydown(function(){
        if(pageGlobalTimeout){
            clearInterval(pageGlobalTimeout)
        }
        pageGlobalTimeout = setTimeout(function(){
            $.ajax({
                type: 'GET',
                url: '/route/article',
                data: {
                    url : $('#page-url').val()
                },
                success: function(data) {
                    $('#page-text').html(data.text)
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        },2000)
    })

    $('#textarea').mousedown(function(e){
        var x = e.pageX
        var y = e.pageY

        $('#textarea').mouseup(function(ev){
            $('#textarea').unbind('mouseup')
            console.log('msg')
            if(ev.pageX !== x || ev.pageY !== y){
                var text = getSelection()
                console.log(text)
            }
            else
                return

            var indent = 0
            if(e.shiftKey)
                indent = 1

            $.ajax({
                type: 'POST',
                url: '/route/add_note',
                data: {
                    id: rendify.currentTopic,
                    note: text,
                    indent: indent
                },
                success: function(data) {
                    //
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        })
    })

    $('#page-text').mousedown(function(e){
        var x = e.pageX
        var y = e.pageY

        $('#page-text').mouseup(function(ev){
            $('#page-text').unbind('mouseup')
            console.log('msg')
            if(ev.pageX !== x || ev.pageY !== y){
                var text = getSelection()
                console.log(text)
            }
            else
                return

            var indent = 0
            if(e.shiftKey)
                indent = 1

            $.ajax({
                type: 'POST',
                url: '/route/add_note',
                data: {
                    id: rendify.currentTopic,
                    note: text,
                    indent: indent
                },
                success: function(data) {
                    //
                },
                error: function(jqXHR) {
                     console.log(jqXHR.responseText)
                }
            })
        })
    })

    root.rendify = rendify

}())