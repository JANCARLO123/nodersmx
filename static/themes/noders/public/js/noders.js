/* jshint browser: true, strict: true, undef: true */
/* jshint camelcase: false */
(function( window ) {
    'use strict';
    /*!
    * dat_class - helper to add, remove and check class status of an element
    */

    var classReg = function ( className ) {
        return new RegExp('(^|\\s+)' + className + '(\\s+|$)');
    };

    var hasClass, addClass, removeClass;

    if ( 'classList' in document.documentElement ) {
        hasClass = function( elem, c ) {
            return elem.classList.contains( c );
        };
        addClass = function( elem, c ) {
            elem.classList.add( c );
        };
        removeClass = function( elem, c ) {
            elem.classList.remove( c );
        };
    } else {
        hasClass = function( elem, c ) {
            return classReg( c ).test( elem.className );
        };
        addClass = function( elem, c ) {
            if ( !hasClass( elem, c ) ) {
                elem.className = elem.className + ' ' + c;
            }
        };
        removeClass = function( elem, c ) {
            elem.className = elem.className.replace( classReg( c ), ' ' );
        };
    }

    var toggleClass = function( elem, c ) {
        var fn = hasClass( elem, c ) ? removeClass : addClass;
        fn( elem, c );
    };

    var dat_class = {
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
    };

    if ( typeof define === 'function' && define.amd ) {
        define( dat_class );
    } else {
        window.dat_class = dat_class;
    }

    /*!
    * float_label - add the 'float label' animation onfocus and remove the animation onblur
    */

    var float_label = function( input ){
        var form_input = document.querySelector( input );        
        form_input.onfocus = function() {
            dat_class.addClass( this.nextElementSibling, 'active' );
        };
        form_input.onblur = function(){
            if( this.value === '' || this.value === 'blank'){
                dat_class.removeClass( this.nextElementSibling, 'active' );
            }
        };
    };

    if ( typeof define === 'function' && define.amd ) {
        define( float_label );
    } else {
        window.float_label = float_label;
    }


    var width, height, largeHeader, canvas, ctx, points, target, animateHeader = true;

    // Main
    initHeader();
    initAnimation();
    addListeners();

    function polygon( pos, rad, color, sides ) {
        var _this = this;

        // constructor
        (function() {
            _this.pos = pos || null;
            _this.radius = rad || null;
            _this.color = color || null;
            _this.sides = sides || null;
        })();

        this.draw = function() {
            if(!_this.active) return;
            if (_this.sides < 3) return;

            var a = (Math.PI * 2) / _this.sides;
            var i = 1;

            ctx.save();
            ctx.translate( _this.pos.x, _this.pos.y );
            ctx.rotate( 100 );
            ctx.moveTo( _this.radius, 0 );
            for (; i < _this.sides; i++) {
                ctx.lineTo( _this.radius*Math.cos( a*i ), _this.radius*Math.sin( a*i ) );
            }
            ctx.fillStyle = 'rgba('+color+','+ _this.active+')';
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        };
    }

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: width/2, y: height/2};

        largeHeader = document.getElementById('hero-noders');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('node-web');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');

        // create points
        points = [];
        for( var x = 0; x < width; x = x + width/18 ) {
            for( var y = 0; y < height; y = y + height/18 ) {
                var px = x + Math.random()*width/16;
                var py = y + Math.random()*height/16;
                var p = {x: px, originX: px, y: py, originY: py };
                points.push(p);
            }
        }

        // for each point find the 5 closest points
        for(var i = 0; i < points.length; i++) {
            var closest = [];
            var p1 = points[i];
            for(var j = 0; j < points.length; j++) {
                var p2 = points[j]
                if(!(p1 == p2)) {
                    var placed = false;
                    for(var k = 0; k < 5; k++) {
                        if( !placed ) {
                            if( closest[k] == undefined ) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }

                    for(var k = 0; k < 5; k++) {
                        if( !placed ) {
                            if( getDistance(p1, p2) < getDistance(p1, closest[k]) ) {
                                closest[k] = p2;
                                placed = true;
                            }
                        }
                    }
                }
            }
            p1.closest = closest;
        }

        // assign a node to each point
        for(var i in points) {
            var c = new polygon( points[i], ( 2+Math.random()*2 ) * 1.7, '123,207,40', 6);
            points[i].node = c;
        }
    }

    // Event handling
    function addListeners() {
        if(!('ontouchstart' in window)) {
            window.addEventListener('mousemove', mouseMove);
        }
        //window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
    }

    function mouseMove(e) {
        var posx = 0, posy = 0;
        if ( e.clientX || e.clientY )    {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY;
        }
        target.y = posy;
        target.x = posx;
    }

    function scrollCheck() {
        if( document.body.scrollTop > height ) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    // animation
    function initAnimation() {
        if(!('ontouchstart' in window)) {
            animate();
            for( var i in points ) {
                shiftPoint( points[i] );
            }
        }
    }

    function animate() {
        if( animateHeader ) {
            ctx.clearRect( 0, 0, width, height );
            for(var i in points) {
                // detect points in range
                if( Math.abs( getDistance( target, points[i]) ) < 4000) {
                    points[i].active = 0.3;
                    points[i].node.active = 0.6;
                } else if( Math.abs( getDistance( target, points[i] ) ) < 20000) {
                    points[i].active = 0.1;
                    points[i].node.active = 0.3;
                } else if( Math.abs( getDistance( target, points[i] ) ) < 40000) {
                    points[i].active = 0.02;
                    points[i].node.active = 0.1;
                } else {
                    points[i].active = 0;
                    points[i].node.active = 0;
                }

                drawLines(points[i]);
                points[i].node.draw();
            }
        }
        requestAnimationFrame(animate);
    }

    function shiftPoint(p) {
        TweenLite.to( p, 1+1*Math.random(), {
            x: p.originX-50+Math.random()*100,
            y: p.originY-50+Math.random()*100,
            ease: Circ.easeInOut,
            onComplete: function() {
                shiftPoint( p );
            }
        });
    }

    // Canvas manipulation
    function drawLines(p) {
        if( !p.active ) return;
        for( var i in p.closest ) {
            ctx.beginPath();
            ctx.moveTo( p.x, p.y );
            ctx.lineTo( p.closest[i].x, p.closest[i].y );
            ctx.strokeStyle = 'rgba(123,207,40,'+ p.active+')';
            ctx.stroke();
        }
    }

    // Util
    function getDistance(p1, p2) {
        return Math.pow( p1.x - p2.x, 2 ) + Math.pow( p1.y - p2.y, 2 );
    }

    var animate_dash = function ( path, time ){
        var length = path.getTotalLength();
        path.style.strokeWidth = '1';
        path.style.transition = path.style.WebkitTransition = 'none';
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = length;

        path.getBoundingClientRect();
        path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + time + ' ease-in-out';
        path.style.strokeDashoffset = '0';
    };

    var animate_fill = function ( path, time, color ){
        path.getBoundingClientRect();
        path.style.strokeWidth = '0';
        path.style.transition = path.style.WebkitTransition = 'fill ' + time + ' ease-in-out';
        path.style.fill = color;
    };

    animate_dash( document.querySelector('#noders .letter_nde'), '5s' );
    animate_dash( document.querySelector('#noders .letter_o'), '3s' );
    animate_dash( document.querySelector('#noders .letter_r'), '2.5s' );
    animate_dash( document.querySelector('#noders .letter_s_1'), '2s' );
    animate_dash( document.querySelector('#noders .letter_s_2'), '2s' );

    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_nde'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_o'), '0', '#8EC74E' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_r'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_s_1'), '0', '#ffffff' ); } , 2500 );
    setTimeout( function(){ animate_fill( document.querySelector('#noders .letter_s_2'), '0', '#8EC74E' ); } , 2500 );

    var map_style = [
    {"featureType":"water","elementType":"geometry","stylers":[{"color":"#7fc8ed"}]},
    {"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f2f2f2"}]},
    {"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#d0e3b4"}]},
    {"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"color":"#ffffff"}]},
    {"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#6ecbab"}]},
    {"featureType":"poi.medical","elementType":"geometry","stylers":[{"visibility":"off"}]},
    {"featureType":"poi.business","stylers":[{"visibility":"on"}]},
    {"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},
    {"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},
    {"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},
    {"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#f3f4f4"}]},
    {"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffe9ae"}]},
    {"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},
    {"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]}]

    var map_center = new google.maps.LatLng( 19.4128709,-99.1664372 );
    
    var map_options = {
        zoom: 16,
        zoomControl: true,
        panControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        scrollwheel: false,
        center: map_center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: map_style
    };
    var map = new google.maps.Map( document.getElementById('place_map'), map_options );

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng( 19.41309,-99.16531 ),
        map: map,
        icon: '/static/img/marker_map.png',
        flat: true
    });

    float_label('#javascriptmx_email');

    var next_button = document.getElementById('hero-text');
    next_button.addEventListener('click',
        function ( e ) {
            e.preventDefault();
            var content = document.getElementById('content');
            var step = 16;
            var offset = 0;
            var scroll_interval = setInterval( function() {
                offset = ( content.offsetTop <= offset ) ? content.offsetTop : offset += step;
                window.scrollTo( 0, offset );
                if( offset >= content.offsetTop )
                    clearInterval(scroll_interval);
            } , 10);
        },
    false );

})( window );


$('#jsmx').ajaxChimp({
    callback: function mailchimpCallback(resp) {
        console.log( resp );
        if (resp.result === 'success') {
            $('#jsmx input, #jsmx button, #jsmx label').hide();
            $('#subscription-msg').removeClass().addClass('success').html('Revisa tu correo y confirma la subscripción');
        } else if(resp.result === 'error') {
            /* $('#jsmx input, #jsmx button').hide(); */
            $('#jsmx label').html('Tu email');
            $('#subscription-msg').removeClass().addClass('error').html( resp.msg );
        }
    },
    lang: 'es',
    url: "//javascriptmx.us2.list-manage.com/subscribe/post?u=d7fe6986f079260108045fa95&amp;id=7e070c02cd"
});