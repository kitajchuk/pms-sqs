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


loader = {
    showLoading: function () {
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


    stopLoading: function () {
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

                loader.resetLoadable();
            },
            duration: duration2
        });
    },


    resetLoadable: function () {
        $_jsLoader.removeClass( "is-loading" );

        setTimeout(function () {
            $_jsLoader.attr( "style", "" );

        }, duration2 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default loader;