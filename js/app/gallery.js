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
import { hammered, loadImages } from "app/util";
import { duration1, duration2 } from "app/config";


var $_jsGalleries = $( ".js-gallery" ),

    _isInit = false,
    _isSwiping = false,
    _swipeOut = null,


name = "gallery",


/**
 *
 * Initialize gallerys
 * @method init
 * @memberof gallery
 *
 */
init = function () {
    if ( _isInit ) {
        return;
    }

    _isInit = true;

    hammered.on( "tap", ".js-gallery-indicator-item", onTouchTap );
    hammered.on( "release", ".js-gallery-collection-item", onTouchRelease );
    hammered.on( "dragleft", ".js-gallery-collection-item", onTouchSwipe );
    hammered.on( "dragright", ".js-gallery-collection-item", onTouchSwipe );

    $_jsGalleries.each(function () {
        var $this = $( this ),
            $indicators = $this.find( ".js-gallery-indicator-item" );

        loadImages( $this.find( ".js-lazy-slide" ) );

        hammered.trigger( "tap", $indicators[ 0 ] );
    });

    console.log( "[gallery module init]" );
},


/**
 *
 * Perform the action on swipe
 * @method handleSwiped
 * @param {string} direction the swipe direction
 * @param {object} element the element swiped
 * @memberof gallery
 * @private
 *
 */
handleSwiped = function ( direction, element ) {
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
        increment = ( direction === "left" ) ? 1 : -1,
        total = ($items.length - 1),
        index = element.index();

    // Swipe from first to last
    if ( index === 0 && direction === "right" ) {
        index = ($items.length - 1);

    // Swipe from last to first
    } else if ( index === total && direction === "left" ) {
        index = 0;

    // Swipe in middle of elements
    } else {
        index = index + increment;
    }

    hammered.trigger( "tap", $indicators[ index ] );
},


/**
 *
 * Handle the indicator tap
 * @method onTouchTap
 * @param {object} e The event object
 * @memberof gallery
 * @private
 *
 */
onTouchTap = function ( e ) {
    e.preventDefault();
    e.gesture.preventDefault();

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


/**
 *
 * Handle the swipe event
 * @method onTouchSwipe
 * @param {object} e The event object
 * @memberof gallery
 * @private
 *
 */
onTouchSwipe = function ( e ) {
    e.preventDefault();
    e.gesture.preventDefault();

    $( this ).data( "swiped", true );
},


/**
 *
 * Handle the release event
 * @method onTouchRelease
 * @param {object} e The event object
 * @memberof gallery
 * @private
 *
 */
onTouchRelease = function ( e ) {
    var $this = $( this );

    if ( $this.data( "swiped" ) ) {
        $this.data( "swiped", false );

        handleSwiped( e.gesture.direction, $this );
    }
};

/******************************************************************************
 * Export
*******************************************************************************/
export { name, init };