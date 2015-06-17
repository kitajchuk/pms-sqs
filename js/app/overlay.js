/*!
 *
 * App Module: /overlay
 *
 * A nice description of what this module does...
 *
 *
 */
import { duration2 } from "app/config";
import { hammered, emitter, toggleMouseWheel } from "app/util";


var $_jsOverlay = $( ".js-overlay" ),
    $_jsPage = $( ".js-page" ),
    $_jsOverlayContent = $( ".js-overlay-content" ),

    _isInit = false,
    _isOpen = false,


/**
 *
 * Module init method, called once
 * @method init
 * @memberof overlay
 *
 */
init = function () {
    if ( _isInit || !$_jsOverlay.length ) {
        return;
    }

    _isInit = true;

    hammered.on( "tap", ".js-overlay", onTouchTapOverlay );
    hammered.on( "drag", ".js-overlay", onTouchDragOverlay );
},


/**
 *
 * Module isOpen method, called once
 * @method isOpen
 * @memberof overlay
 * @returns boolean
 *
 */
isOpen = function () {
    return _isOpen;
},


/**
 *
 * Handle closing the overlay on taps
 * @method onTouchTapOverlay
 * @param {object} e The event object
 * @memberof overlay
 * @private
 *
 */
onTouchTapOverlay = function ( e ) {
    var $target = $( e.target );

    if ( $target.is( ".js-overlay, .js-overlay-content, .js-list" ) ) {
        close();
    }
},


/**
 *
 * Prevent page scrolling while stuff is open
 * @method onTouchDragScreen
 * @param {object} e The event object
 * @memberof overlay
 * @private
 *
 */
onTouchDragOverlay = function ( e ) {
    e.preventDefault();
    e.gesture.preventDefault();
},


/**
 *
 * Module open method, opens the overlay
 * @method open
 * @fires overlay-open
 * @memberof overlay
 *
 */
open = function () {
    _isOpen = true;

    $_jsOverlay.addClass( "is-active" );
    $_jsPage.addClass( "is-overlain" );

    toggleMouseWheel( false );

    setTimeout(function () {
        $_jsOverlayContent.addClass( "is-active" );

    }, duration2 );

    emitter.fire( "overlay-open" );
},


/**
 *
 * Module close method, closes the overlay
 * @method close
 * @fires overlay-close
 * @memberof overlay
 *
 */
close = function () {
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

    emitter.fire( "overlay-close" );
};


/******************************************************************************
 * Export
*******************************************************************************/
export { init, open, close, isOpen };