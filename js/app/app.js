/*!
 *
 * App Generic
 *
 *
 */
import "node_modules/jquery/dist/jquery";
import "node_modules/hammerjs/hammer";
import "lib/funpack";
import "app/env";
import "app/posts";
import "app/gallery";
import "app/collection";
import { duration1, duration3 } from "app/config";
import { onImageLoadHandler, loadImages, resizeElements, resizer, emitter, scroller } from "app/util";


var $_window = $( window ),
    $_jsBody = $( ".js-body" ),
    $_jsHtml = $( ".js-html" ),
    $_jsScroll = $_jsBody.add( $_jsHtml ),

    debounce = funpack( "debounce" ),


/**
 *
 * Globalized transition elements
 *
 */
doActivateElemsAction = function () {
    emitter.stop();
    emitter.go(function () {
        var $transitions = $( ".js-activate" ),
            $inactive = $transitions.not( ".is-active" );

        if ( !$inactive.length ) {
            emitter.stop();
            console.log( "all content activated" );
            return;
        }

        $inactive.each(function () {
            var $this = $( this );

            if ( onImageLoadHandler( $this ) ) {
                $this.addClass( "is-active" );
            }
        });
    });
},


/**
 *
 * Globalized image loading for reals
 *
 */
doImageLoadAction = function ( callback ) {
    var selector = ".js-lazy-image",
        $images = $( selector ),
        $visible = $( [] ),
        delayedLoad = function () {
            setTimeout( callback, duration3 );

            if ( $images.length !== $visible.length ) {
                loadImages( $images.not( $visible ), onImageLoadHandler ).on( "done", function () {
                    console.log( "all page images loaded" );
                });

            } else {
                console.log( "all page images loaded" );
            }
        };

    $images.each(function () {
        var $this = $( this );

        if ( onImageLoadHandler( $this ) ) {
            $visible.push( this );
        }
    });

    if ( !$visible.length ) {
        delayedLoad();

    } else {
        loadImages( $visible ).on( "done", function () {
            delayedLoad();
        });
    }
},


/**
 *
 * Handle loading Squarespace video on routing
 *
 */
doSquarespaceVideoAction = function () {
    Y.all( ".sqs-block.video-block .sqs-block-content, .sqs-block.embed-block .sqs-block-content" ).each(function ( b ) {
        Y.Squarespace.UrlUtils.securifyBlockEmbed( b );
        if ( b.test( ".sqs-block.video-block .sqs-block-content" ) ) {
            b = b.one( ".sqs-video-wrapper" );
            Squarespace.initializeVideoBlock( b );
        }
    });
},


/**
 *
 * Apply a selector that adjusts styling when captions are present
 *
 */
doSquarespaceVideoHack = function () {
    var $videos = $( ".sqs-block-video" );

    $videos.each(function () {
        var $this = $( this ),
            video = Y.one( $this.find( ".sqs-video-wrapper" )[ 0 ] ).plug().videoloader;

        if ( $this.find( ".video-caption-wrapper" ).length ) {
            $this.addClass( "is-caption" );
        }

/*
        if ( Modernizr.touch ) {
            video.showVideo();
        }
*/
    });
},


/**
 *
 * Apply a classname that set visibility state of elements
 *
 */
doScrollerAction = function () {
    var scrollPos = scroller.getScrollY(),
        offsetTop,
        offsetBot,
        $this;

    $( ".js-article" ).each(function () {
        $this = $( this );
        offsetTop = $this.offset().top;
        offsetBot = (offsetTop + $this.height());

        // Post is within the viewport
        if ( (scrollPos + window.innerHeight) > offsetTop && scrollPos < offsetBot ) {
            $this.addClass( "is-visible" );

        } else {
            $this.removeClass( "is-visible" );
        }
    });
};


/**
 *
 * Hijack non-linked links
 * @event app-suppress-hash-links
 *
 */
$_jsBody.on( "click", "[href=#]", function ( e ) {
    e.preventDefault();
});


/**
 *
 * Window resize event handling
 * @event app-window-resize
 *
 */
resizer.on( "resize", debounce(function () {
    resizeElements();
    doScrollerAction();
}));


/**
 *
 * Window scroll event handling
 * @event app-window-scroll
 *
 */
scroller.on( "scroll", doScrollerAction );


/**
 *
 * Initialize modules on window load
 * @event app-window-load
 * @event cycle-transition-content
 *
 */
$_window.on( "load", function () {
    resizeElements();
    doScrollerAction();
    doActivateElemsAction();
    doImageLoadAction(function () {
        doSquarespaceVideoHack();
        // Animate body into view
        $_jsBody.addClass( "is-animate is-active" );
        setTimeout(function () {
            $_jsBody.removeClass( "is-animate" );
            $_jsHtml.removeClass( "-contain" );

        }, duration1 );
    });

    // Force experience to start at top of page
    $_jsScroll.animate( {scrollTop: 0}, "fast" );

    // Restart the transition controller
    emitter.on( "cycle-transition-content", doActivateElemsAction );

    // Initialize modules
    posts.init();
    gallery.init();
    collection.init();
});