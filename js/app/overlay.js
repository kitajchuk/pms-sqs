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

    _isInit = false,


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

    hammered.on( "tap", ".js-overlay", close );
    hammered.on( "drag", ".js-overlay", onTouchDragOverlay );
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
    $_jsOverlay.addClass( "is-active" );

    toggleMouseWheel( false );

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
    $_jsOverlay.addClass( "is-leaving" );

    toggleMouseWheel( true );

    setTimeout(function () {
        $_jsOverlay.removeClass( "is-active is-leaving" );

    }, duration2 );

    emitter.fire( "overlay-close" );
};


/******************************************************************************
 * Export
*******************************************************************************/
export { init, open, close };