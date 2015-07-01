/*!
 *
 * App Module: /gallery
 *
 * @namespace gallery
 * @memberof app
 *
 * @todo: hand jammer / tap to advance
 *
 *
 */
import "app/dom";
import { hammered, loadImages, resizeElems } from "app/util";
import { duration1, duration2 } from "app/config";


var $_jsGallery = null,

    _location = window.location,
    _isSwiping = false,
    _swipeOut = null,
    _isActive = false,
    _isLoaded = false,


gallery = {
    init: function () {
        console.log( "gallery initialized" );
    },


    isActive: function () {
        return _isActive;
    },


    isLoaded: function () {
        return _isLoaded;
    },


    onload: function () {
        _isActive = this.getElements();

        if ( _isLoaded ) {
            return;

        } else if ( !_isActive ) {
            return;
        }

        hammered.on( "tap", ".js-gallery-collection-item", onTouchTapCollection );
        hammered.on( "tap", ".js-gallery-indicator-item", onTouchTapIndicator );
        hammered.on( "panend", ".js-gallery-collection-item", onTouchRelease );
        hammered.on( "panleft", ".js-gallery-collection-item", onTouchSwipe );
        hammered.on( "panright", ".js-gallery-collection-item", onTouchSwipe );

        this.loadAll();
    },


    unload: function () {
        if ( _isLoaded ) {
            this.teardown();
        }
    },


    getElements: function () {
        $_jsGallery = dom.page.find( ".js-gallery" );

        return ( $_jsGallery.length );
    },


    teardown: function () {
        _isSwiping = false;
        _swipeOut = null;
        _isActive = false;
        _isLoaded = false;

        $_jsGallery = null;

        hammered.off( "tap", onTouchTapCollection );
        hammered.off( "tap", onTouchTapIndicator );
        hammered.off( "panend", onTouchRelease );
        hammered.off( "panleft", onTouchSwipe );
        hammered.off( "panright", onTouchSwipe );
    },


    loadAll: function () {
        $_jsGallery.each(function () {
            var $this = $( this ),
                $items = $this.find( ".js-gallery-collection-item" ),
                $collection = $this.find( ".js-gallery-collection" ),
                $indicators = $this.find( ".js-gallery-indicator-item" );

            $this.addClass( "is-visited" );

            if ( _location.pathname.replace( /^\/|\/$/g, "" ).split( "/" ).length > 1 ) {
                $this.addClass( "gallery--static" );
                $collection.removeClass( "js-resize" );
                $items.removeClass( "js-lazy-slide" ).addClass( "js-resize js-lazy-image" ).data( "resize", "post" );

                loadImages( $items );
                resizeElems();

            } else {
                $items.first().addClass( "is-active" );
                $indicators.first().addClass( "is-active" );

                loadImages( $items );
            }
        });
    }
},


handleSwiped = function ( e, element ) {
    // Check swiping state
    if ( _isSwiping ) {
        return false;
    }

    // Otherwise set the swiping state
    _isSwiping = true;

    setTimeout(function () {
        _isSwiping = false;

    // Timeout for duration of animation
    }, duration2 );

    // Handle the swipe
    var $gallery = element.closest( ".js-gallery" ),
        $items = $gallery.find( ".js-gallery-collection-item" ),
        $indicators = $gallery.find( ".js-gallery-indicator-item" ),
        increment = ( e.direction === Hammer.DIRECTION_LEFT ) ? 1 : -1,
        total = ($items.length - 1),
        index = element.index();

    // Swipe from first to last
    if ( index === 0 && e.direction === Hammer.DIRECTION_RIGHT ) {
        index = ($items.length - 1);

    // Swipe from last to first
    } else if ( index === total && e.direction === Hammer.DIRECTION_LEFT ) {
        index = 0;

    // Swipe in middle of elements
    } else {
        index = index + increment;
    }

    onTouchTapIndicator.call( $indicators[ index ], e );
},


onTouchTapCollection = function ( e ) {
    var $this = $( this ),
        $gallery = $this.closest( ".js-gallery" ),
        $indicators = $gallery.find( ".js-gallery-indicator-item" ),
        index = $this.index(),
        length = $indicators.length;

    if ( index === (length - 1) ) {
        index = 0;

    } else {
        index = (index + 1);
    }

    onTouchTapIndicator.call( $indicators[ index ], e );
},


onTouchTapIndicator = function ( e ) {
    e.preventDefault();

    var $this = $( this ),
        $gallery = $this.closest( ".js-gallery" ),
        $items = $gallery.find( ".js-gallery-collection-item" ),
        $itemActive = $items.filter( ".is-active" ),
        $itemNext = $items.eq( $this.index() ),
        $indicators = $gallery.find( ".js-gallery-indicator-item" );

    try {
        clearTimeout( _swipeOut );

        $items.removeClass( "is-entering is-exiting is-active" );

    } catch ( error ) {}

    $indicators.removeClass( "is-active" );
    $this.addClass( "is-active" );

    $itemActive.removeClass( "is-active" ).addClass( "is-exiting" );
    $itemNext.addClass( "is-entering" );

    _swipeOut = setTimeout(function () {
        clearTimeout( _swipeOut );

        $itemActive.removeClass( "is-exiting" );
        $itemNext.removeClass( "is-entering" ).addClass( "is-active" );

    }, duration1 );
},


onTouchSwipe = function ( e ) {
    e.preventDefault();

    $( this ).data( "swiped", true );
},


onTouchRelease = function ( e ) {
    var $this = $( this );

    if ( $this.data( "swiped" ) ) {
        $this.data( "swiped", false );

        handleSwiped( e, $this );
    }
};

/******************************************************************************
 * Export
*******************************************************************************/
export default gallery;