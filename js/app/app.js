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
import { duration1, duration3 } from "app/config";
import { resizeElements, loadImages, onImageLoadHandler } from "app/util";


var $_window = $( window ),
    $_jsBody = $( ".js-body" ),
    $_jsHtml = $( ".js-html" ),
    $_jsScroll = $_jsBody.add( $_jsHtml ),


/**
 *
 * Globalized image loading for reals
 *
 */
doImageLoadAction = function ( callback ) {
    var selector = ( Modernizr.touch ) ? ".js-lazy-image:not(.js-feature-image)" : ".js-lazy-image",
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
};


/**
 *
 * Initialize modules on window load
 * @event app-window-load
 * @event cycle-transition-content
 *
 */
$_window.on( "load", function () {
    resizeElements();
    doImageLoadAction(function () {
        // Animate body into view
        $_jsBody.addClass( "is-animate is-active" );
        setTimeout(function () {
            $_jsBody.removeClass( "is-animate" );
            $_jsHtml.removeClass( "-contain" );

        }, duration1 );
    });

    // Force experience to start at top of page
    $_jsScroll.animate( {scrollTop: 0}, "fast" );
});