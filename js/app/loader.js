/*!
 *
 * App Module: /loader
 *
 * A nice description of what this module does...
 *
 *
 */
import { duration2 } from "app/config";


var $_jsLoader = $( ".js-loader" ),

    Tween = require( "Tween" ),
    Easing = require( "Easing" ),

    _tween = null,


name = "loader",


/**
 *
 * Module showLoading method, animate loading bar
 * @method showLoading
 * @memberof loader
 *
 */
showLoading = function () {
    $_jsLoader.addClass( "is-loading" );

    _tween = new Tween({
        to: window.innerWidth,
        from: 0,
        ease: Easing.easeOutCubic,
        update: function ( t ) {
            $_jsLoader.css( "width", t );
        },
        complete: function ( t ) {
            $_jsLoader.css( "width", t );
        },
        duration: 40000
    });
},


/**
 *
 * Module stopLoading method, stop load animation
 * @method stopLoading
 * @memberof loader
 *
 */
stopLoading = function () {
    _tween.stop();

    _tween = new Tween({
        to: window.innerWidth,
        from: $_jsLoader.width(),
        ease: Easing.easeOutCubic,
        update: function ( t ) {
            $_jsLoader.css( "width", t );
        },
        complete: function ( t ) {
            $_jsLoader.css( "width", t );

            resetLoadable();
        },
        duration: duration2
    });
},


/**
 *
 * Module resetLoadable method, clear the loader styles
 * @method resetLoadable
 * @memberof loader
 *
 */
resetLoadable = function () {
    $_jsLoader.removeClass( "is-loading" );

    setTimeout(function () {
        $_jsLoader.attr( "style", "" );

    }, duration2 );
};


export { name, showLoading, stopLoading, resetLoadable }