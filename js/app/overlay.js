/*!
 *
 * App Module: /overlay
 *
 * A nice description of what this module does...
 *
 *
 */
import { duration2 } from "app/config";
import { hammered, toggleMouseWheel } from "app/util";


var $_jsOverlay = $( ".js-overlay" ),
    $_jsPage = $( ".js-page" ),
    $_jsOverlayContent = $( ".js-overlay-content" ),

    _isOpen = false,


overlay = {
    init: function () {
        hammered.on( "tap", ".js-overlay", onTouchTapOverlay );
        hammered.on( "panmove", ".js-overlay", onTouchMoveOverlay );
    },


    isOpen: function () {
        return _isOpen;
    },


    open: function () {
        _isOpen = true;

        $_jsOverlay.addClass( "is-active" );
        $_jsPage.addClass( "is-overlain" );

        toggleMouseWheel( false );

        setTimeout(function () {
            $_jsOverlayContent.addClass( "is-active" );

        }, duration2 );
    },


    close: function () {
        _isOpen = false;

        $_jsOverlayContent.removeClass( "is-active" );

        toggleMouseWheel( true );

        setTimeout(function () {
            $_jsOverlay.addClass( "is-leaving" );
            $_jsPage.removeClass( "is-overlain" );

            setTimeout(function () {
                $_jsOverlay.removeClass( "is-active is-leaving" );

            }, duration2 );

        }, duration2 );
    }
},


onTouchTapOverlay = function ( e ) {
    var $target = $( e.target );

    if ( $target.is( ".js-overlay, .js-overlay-content, .js-list" ) ) {
        overlay.close();
    }
},


onTouchMoveOverlay = function ( e ) {
    e.preventDefault();
};


/******************************************************************************
 * Export
*******************************************************************************/
export default overlay;