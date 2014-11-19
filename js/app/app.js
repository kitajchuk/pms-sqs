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
import "app/overlay";
import "app/gallery";
import "app/collection";
import { duration1, duration3 } from "app/config";
import { onImageLoadHandler, loadImages, resizeElements, resizer, emitter, scroller, hammered } from "app/util";


var $_window = $( window ),
    $_jsBody = $( ".js-body" ),
    $_jsHtml = $( ".js-html" ),
    $_jsPage = $( ".js-page" ),
    $_jsModule = $( ".js-module" ),
    $_jsScroll = $_jsBody.add( $_jsHtml ),

    debounce = funpack( "debounce" ),
    PageController = funpack( "PageController" ),
    pageController = new PageController({
        anchorTop: false,
        transitionTime: 200
    }),


/**
 *
 * Initialize the PageController management
 *
 */
initPageController = function () {
    pageController.setConfig([
        "/",
        "homepage",
        "feed",
        "feed/:slug!slug",
        "about"
    ]);
    pageController.initPage();

    // Hook into page controller events
    pageController.on( "page-controller-router-transition-out", function () {
        $_jsModule.removeClass( "is-reactive" ).addClass( "is-inactive" );
    });

    pageController.on( "page-controller-router-transition-in", function ( data ) {
        var $html = $( data.response ),
            $title = $html.filter( "title" ),
            $module = $html.find( ".js-module" ),
            render = $module.html();

        document.title = $title.text();

        $_jsModule.empty().html( render );
        $_window.scrollTop( 0 );
        $_jsModule.addClass( "is-reactive" ).removeClass( "is-inactive" );

        doPageNameAction();

        // Track Squarespace Metrics
        doPageviewAction( $module[ 0 ].id );

        // Load galleries
        gallery.loadAll();

        resizeElements();
        doScrollerAction();
        doActivateElemsAction();
        doSquarespaceVideoAction();
        doSquarespaceVideoHack();
        doImageLoadAction();
    });

    // Expose for development
    app.pageController = pageController;
},


/**
 *
 * Fire a pageview
 *
 */
doPageviewAction = function ( id ) {
    var fullUrl = window.location.pathname,
        title = document.title.split( "—" )[ 0 ].replace( /^\s+|\s+$/g, "" ),
        datas = id.split( "-" ),
        track = {
            fullUrl: fullUrl,
            title: title,
            id: datas[ 1 ]
        };

    // Track an item
    if ( window.location.pathname.replace( /^\/|\/$/, "" ).split( "/" ).length > 1 ) {
        track.commentState = 2;
        track.publicCommentCount = 0;
        track.recordType = 1;
    }

    Y.Squarespace.Analytics.view( datas[ 0 ], track );

    console.log( "Squarespace analytics tracker : pageview", datas[ 0 ], track );
},


/**
 *
 * Swap the page className page--{section}
 *
 */
doPageNameAction = function () {
    var namespace = pageController.getRoute().split( "/" ).shift().toLowerCase(),
        classname = $_jsPage[ 0 ].className.replace( /\spage--\w+\s/, " page--" + (namespace || "feed") + " " );

    $_jsPage[ 0 ].className = classname;
},


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
        var $this = $( this );

        if ( $this.find( ".video-caption-wrapper" ).length ) {
            $this.addClass( "is-caption" );
        }
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
        offsetBot = (offsetTop + $this.outerHeight());

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
    initPageController();
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
    overlay.init();
    gallery.init();
    collection.init();

    hammered.on( "tap", ".js-colophon-icon", function () {
        overlay.open();
    });
});