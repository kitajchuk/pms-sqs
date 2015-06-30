/*!
 *
 * App Module: /util
 *
 * @namespace util
 * @memberof app
 *
 *
 */
import "app/dom";
import "lib/proper";
import { gridMaxWidth, postAspect } from "app/config";


var Hammered = require( "Hammered" ),
    Controller = require( "Controller" ),
    ScrollController = require( "ScrollController" ),
    ResizeController = require( "ResizeController" ),
    ImageLoader = require( "ImageLoader" ),

    mathMin = Math.min,
    mathAbs = Math.abs,


/**
 *
 * Single app instanceof Hammer
 * @member hammered
 * @memberof util
 *
 */
hammered = new Hammered( dom.body[ 0 ], {
    cssProps: {
        contentZoomingString: false,
        tapHighlightColorString: false,
        touchCalloutString: false,
        touchSelectString: false,
        userDragString: false,
        userSelectString: false
    }
}),


/**
 *
 * Single app instanceof Controller for arbitrary event emitting
 * @member emitter
 * @memberof util
 *
 */
emitter = new Controller(),


/**
 *
 * Single app instanceof Scroller
 * @member scroller
 * @memberof util
 *
 */
scroller = new ScrollController(),


/**
 *
 * Single app instanceof Resizer
 * @member resizer
 * @memberof util
 *
 */
resizer = new ResizeController(),


/**
 *
 * Apply a translate3d transform
 * @method translate3d
 * @param {object} el The element to transform
 * @param {string|number} x The x value
 * @param {string|number} y The y value
 * @param {string|number} z The z value
 * @memberof util
 *
 */
translate3d = function ( el, x, y, z ) {
    el.style[ Hammer.prefixed( el.style, "transform" ) ] = "translate3d(" + x + "," + y + "," + z + ")";
},


/**
 *
 * Get nearest value from an array of numbers given a control number
 * @method closestValue
 * @param {number} num The control Number
 * @param {object} arr The array to check
 * @returns Number
 * @memberof util
 *
 */
closestValue = function ( num, arr ) {
    var curr = arr[ 0 ],
        diff = mathAbs( num - curr );

    for ( var val = arr.length; val--; ) {
        var newdiff = mathAbs( num - arr[ val ] );

        if ( newdiff < diff ) {
            diff = newdiff;
            curr = arr[ val ];
        }
    }

    return curr;
},


/**
 *
 * Get next highest value from the original closest value
 * @method closestValueUp
 * @param {number} num The control Number
 * @param {object} arr The array to check
 * @returns Number
 * @memberof util
 *
 */
closestValueUp = function ( num, arr ) {
    var curr = arr[ 0 ],
        diff = mathAbs( num - curr );

    for ( var val = arr.length; val--; ) {
        var newdiff = mathAbs( num - arr[ val ] );

        if ( arr[ val ] > num && newdiff < diff ) {
            diff = newdiff;
            curr = arr[ val ];
        }
    }

    return curr;
},


/**
 *
 * Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @param {function} callback Optional callback when loaded
 * @memberof util
 *
 */
loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || isImageLoadable);

    // Normalize the images
    images = (images || $( ".js-lazy-image" ));

    // Get the right size image for the job
    images.each(function () {
        var $img = $( this ),
            data = $img.data(),
            width = mathMin( ($img.width() || $img.parent().width()), gridMaxWidth ),
            nextSize,
            variant,
            variants;

        if ( data.variants ) {
            variants = data.variants.split( "," );

            for ( var i = variants.length; i--; ) {
                variants[ i ] = parseInt( variants[ i ], 10 );
            }

            variant = closestValue( width, variants );
            nextSize = closestValueUp( variant, variants );

            // Test out the size, maybe we need to bump it up
            // Consequently, Squarespace will not serve over 1500w
            // so this may just really be a test in futility.
            if ( variant < width && nextSize ) {
                variant = nextSize;
            }

            // Test and bump again, mobile size needs a boost
            // since our primary focus deals in the retina arena.
            if ( window.innerWidth <= 480 ) {
                variant = closestValueUp( variant, variants );
            }

            $img.attr( "data-img-src", data.imgSrc + "?format=" + variant + "w" );
        }
    });

    return new ImageLoader({
        elements: images,
        property: "data-img-src",
        transitionDelay: 0

    // Default handle method. Can be overriden.
    }).on( "data", handler );
},


/**
 *
 * Module onImageLoadHander method, handles event
 * @method isImageLoadable
 * @param {object} el The DOMElement to check the offset of
 * @returns boolean
 * @memberof util
 *
 */
isImageLoadable = function ( el ) {
    var bounds = el.getBoundingClientRect();

    return ( bounds.top < (window.innerHeight * 2) );
},


/**
 *
 * Module isElementInViewport method, handles element boundaries
 * @method isElementInViewport
 * @param {object} el The DOMElement to check the offsets of
 * @returns boolean
 * @memberof util
 *
 */
isElementInViewport = function ( el ) {
    var bounds = el.getBoundingClientRect();

    return ( bounds.top < window.innerHeight && bounds.bottom > 0 );
},


/**
 *
 * Toggle on/off scrollability
 * @method toggleMouseWheel
 * @param {boolean} enable Flag to enable/disable
 * @memberof util
 *
 */
toggleMouseWheel = function ( enable ) {
    if ( enable ) {
        dom.doc.off( "DOMMouseScroll mousewheel" );

    } else {
        dom.doc.on( "DOMMouseScroll mousewheel", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 *
 * Toggle on/off touch movement
 * @method toggleTouchMove
 * @param {boolean} enable Flag to enable/disable
 * @memberof util
 *
 */
toggleTouchMove = function ( enable ) {
    if ( enable ) {
        dom.doc.off( "touchmove" );

    } else {
        dom.doc.on( "touchmove", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 *
 * Resize elements based on keyword
 * @method resizeElems
 * @param {object} elems Optional collection to resize
 * @memberof util
 *
 */
resizeElems = function ( elems ) {
    (elems || $( ".js-resize" )).each(function () {
        var $this = $( this ),
            data = $this.data(),
            css = {};

        if ( data.resize === "post" ) {
            if ( window.innerWidth <= 640 ) {
                css.height = window.innerWidth / postAspect;

            } else {
                css.height = $this.width() / postAspect;
            }
        }

        $this.css( css );
    });
},


/**
 *
 * Get the applied transition duration from CSS
 * @method getTransitionDuration
 * @param {object} el The DOMElement
 * @memberof util
 * @returns number
 *
 */
getTransitionDuration = function ( el ) {
    if ( !el ) {
        return 0;
    }

    var duration = getComputedStyle( el )[ Hammer.prefixed( el.style, "transition-duration" ) ],
        isSeconds = duration.indexOf( "ms" ) === -1,
        multiplyBy = isSeconds ? 1000 : 1;

    return parseFloat( duration ) * multiplyBy;
},


/**
 *
 * All true all the time
 * @method noop
 * @memberof util
 * @returns boolean
 *
 */
noop = function () {
    return true;
};


/******************************************************************************
 * Export
*******************************************************************************/
export {
    noop,
    hammered,
    emitter,
    scroller,
    resizer,
    translate3d,
    loadImages,
    isImageLoadable,
    isElementInViewport,
    toggleMouseWheel,
    toggleTouchMove,
    resizeElems,
    getTransitionDuration
};