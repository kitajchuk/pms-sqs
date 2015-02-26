import "node_modules/jquery/dist/jquery";
import "node_modules/hammerjs/hammer";
import "app/env";
import "app/posts";
import "app/overlay";
import "app/gallery";
import "app/collection";
import { duration2, duration3 } from "app/config";
import { toggleMouseWheel, onImageLoadHandler, loadImages, resizeElements, emitter, resizer, scroller, hammered } from "app/util";


var $_window = $( window ),
    $_jsBody = $( ".js-body" ),
    $_jsHtml = $( ".js-html" ),
    $_jsPage = $( ".js-page" ),
    $_jsModule = $( ".js-module" ),
    $_jsScroll = $_jsBody.add( $_jsHtml ),
    $_jsLoadin = $( ".js-loadin" ),
    $_jsLoadinLogo = $( ".js-loadin-logo" ),

    debounce = require( "debounce" ),
    PageController = require( "PageController" ),
    pageController = new PageController({
        anchorTop: false,
        transitionTime: duration2
    }),

    _lastData = null,
    _location = window.location.pathname,


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
    pageController.setModules([
        posts
    ]);
    pageController.initPage();

    // Hook into page controller events
    pageController.on( "page-controller-router-transition-out", function () {
        $_jsPage.removeClass( "is-reactive" ).addClass( "is-inactive" );
    });

    pageController.on( "page-controller-router-transition-in", function ( data ) {
        var $html = $( data.response ),
            $title = $html.filter( "title" ),
            $module = $html.find( ".js-module" ),
            render = $module.html();

        document.title = $title.text();

        $_jsModule.empty().html( render );
        $_window.scrollTop( 0 );

        // Transitions between feed/slug pages
        // 0.1 => New data has no slug, so homepage
        // 0.2.1 => Last data does not exist
        // 0.2.2 => Load location was homepage
        // 0.3.1 => Last data exists
        // 0.3.2 => Last data had no slug, so homepage
        // 0.3.3 => New data has slug, so not homepage
        if ( !data.request.params.slug || (!_lastData && _location === "/") || (_lastData && !_lastData.request.params.slug && data.request.params.slug) ) {
            $_jsPage.addClass( "is-reactive" );
        }

        // Update the last location pathname
        _lastData = data;

        if ( data.request.query.tag ) {
            overlay.close();
        }

        doPageNameAction();

        // Track Squarespace Metrics
        doPageviewAction( $module[ 0 ].id );

        // Load galleries
        gallery.loadAll();

        resizeElements();
        doScrollerAction();
        doSquarespaceVideoAction();
        doSquarespaceAudioAction();
        doImageLoadAction();

        setTimeout(function () {
            $_jsPage.removeClass( "is-inactive is-reactive" );

        }, duration2 );
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

    doSquarespaceVideoHack();
},


/**
 *
 * Handle loading Squarespace audio on routing
 *
 */
doSquarespaceAudioAction = function () {
    if ( !Y.Squarespace.Widgets.AudioPlayer ) {
        Squarespace.addLoadTrigger( ".sqs-audio-embed", ["squarespace-audio-player"] );

    } else {
        Y.all( ".sqs-audio-embed" ).each(function ( node ) {
            if ( !node.all( ".sqs-widget" ).size() ) {
                var widget = new Y.Squarespace.Widgets.AudioPlayerMinimal( { render: node } );

                widget.render();
            }
        });
    }
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

    $( ".js-article, .js-activate" ).each(function () {
        $this = $( this );
        offsetTop = $this.offset().top;
        offsetBot = (offsetTop + $this.outerHeight());

        // Post is within the viewport
        if ( (scrollPos + window.innerHeight) > offsetTop && scrollPos < offsetBot ) {
            $this.addClass( "is-visible is-active" );

        } else {
            $this.removeClass( "is-visible is-active" );
        }
    });
},


/**
 *
 * Handle logo screen load in moment
 *
 */
doLoadinAction = function () {
    $_jsLoadin.addClass( "is-leaving" );
    $_jsPage.removeClass( "is-overlain" );

    toggleMouseWheel( true );

    setTimeout(function () {
        $_jsLoadin.removeClass( "is-active is-leaving" );

    }, duration3 );
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
    toggleMouseWheel( false );

    // Initialize modules
    overlay.init();
    gallery.init();
    collection.init();

    initPageController();
    resizeElements();
    doScrollerAction();
    doImageLoadAction(function () {
        doSquarespaceVideoHack();

        $_jsLoadinLogo.addClass( "is-active" );

        setTimeout(function () {
            $_jsLoadinLogo.removeClass( "is-active" );

            setTimeout( doLoadinAction, duration2 );

        }, 1500 );
    });

    // Force experience to start at top of page
    $_jsScroll.animate( {scrollTop: 0}, "fast" );

    hammered.on( "tap", ".js-colophon-icon", function () {
        overlay.open();
    });

    hammered.on( "tap", ".js-tag", function () {
        $( ".js-tag" ).removeClass( "is-active" );
        $( this ).addClass( "is-active" );
    });

    hammered.on( "tap", ".js-logo", function () {
        $( ".js-tag" ).removeClass( "is-active" );
    });

    emitter.on( "load-audio-content", doSquarespaceAudioAction );
    emitter.on( "load-video-content", doSquarespaceVideoAction );
});