/*!
 *
 * App Controller: scrolls
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import { scroller, emitter, noop } from "app/util";


var _timeout = null,
    _idleout = 300,
    _isNones = false,


scrolls = {
    init: function () {
        console.log( "scrolls initialized" );
    },


    isActive: noop,


    isLoaded: noop,


    onload: function () {
        scroller.on( "scroll", onScroller );
        emitter.on( "app--do-scroll", onScroller );

        onScroller();

        this.topout();
    },


    unload: function () {
        this.teardown();
    },


    topout: function ( top ) {
        top = top || 0;

        window.scrollTo( 0, top );
    },


    teardown: function () {
        scroller.off( "scroll", onScroller );
        emitter.off( "app--do-scroll", onScroller );
    }
},


onScroller = function () {
    var scrollPos = scroller.getScrollY();

    try {
        clearTimeout( _timeout );

    } catch ( error ) {}

    if ( !_isNones ) {
        _isNones = true;

        dom.html.addClass( "is-scrolling" );
    }

    _timeout = setTimeout(function () {
        if ( scrollPos === scroller.getScrollY() ) {
            _isNones = false;

            dom.html.removeClass( "is-scrolling" );
        }

    }, _idleout );

    emitter.fire( "app--scroll", scrollPos );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default scrolls;