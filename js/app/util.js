/*!
 *
 * App Module: /util
 *
 * @namespace util
 * @memberof app
 *
 *
 */
import "lib/proper";
import { cssTransform, gridMaxWidth, postAspect } from "app/config";


var Hammered = require( "Hammered" ),
    Controller = require( "Controller" ),
    ScrollController = require( "ScrollController" ),
    ResizeController = require( "ResizeController" ),
    ImageLoader = require( "ImageLoader" ),

    $_jsHtml = $( ".js-html" ),

    // Default DOM handling selectors
    selectors = {
        resize: ".js-resize",
        lazyImg: ".js-lazy-image"
    },

    mathMin = Math.min,
    mathAbs = Math.abs,


/**
 *
 * Single app instanceof Hammer
 * @member hammered
 * @memberof util
 *
 */
hammered = new Hammered( document.body, {
    swipe_velocity: 0,
    stop_browser_behavior: false
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
    el.css( cssTransform, "translate3d(" + x + "," + y + "," + z + ")" );
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
    handler = (handler || onImageLoadHandler);

    // Normalize the images
    images = (images || $( selectors.lazyImg ));

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
        property: "data-img-src"

    // Default handle method. Can be overriden.
    }).on( "data", handler );
},


/**
 *
 * Module onImageLoadHander method, handles event
 * @method onImageLoadHandler
 * @param {object} el The DOMElement to check the offset of
 * @returns boolean
 * @memberof util
 *
 */
onImageLoadHandler = function ( el ) {
    var ret = false,
        y = $( el ).offset().top;

    if ( y < (scroller.getScrollY() + window.innerHeight) ) {
        ret = true;
    }

    return ret;
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
        $_jsHtml.off( "DOMMouseScroll mousewheel" );

    } else {
        $_jsHtml.on( "DOMMouseScroll mousewheel", function ( e ) {
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
        $_jsHtml.off( "touchmove" );

    } else {
        $_jsHtml.on( "touchmove", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 *
 * Resize elements based on keyword
 * @method resizeElements
 * @param {object} elems Optional collection to resize
 * @memberof util
 *
 */
resizeElements = function ( elems ) {
    (elems || $( selectors.resize )).each(function () {
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
 * Resize arbitary width x height region to fit inside another region.
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 * @url: http://opensourcehacker.com/2011/12/01/calculate-aspect-ratio-conserving-resize-for-images-in-javascript/
 * @method calculateAspectRatioFit
 * @memberof util
 * @param {Number} srcWidth Source area width
 * @param {Number} srcHeight Source area height
 * @param {Number} maxWidth Fittable area maximum available width
 * @param {Number} srcWidth Fittable area maximum available height
 * @return {Object} { width, heigth }
 *
 */
calculateAspectRatioFit = function( srcWidth, srcHeight, maxWidth, maxHeight ) {
    var ratio = mathMin( (maxWidth / srcWidth), (maxHeight / srcHeight) );

    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
};


/******************************************************************************
 * Export
*******************************************************************************/
export { hammered, emitter, scroller, resizer, translate3d, loadImages, onImageLoadHandler, toggleMouseWheel, toggleTouchMove, resizeElements, calculateAspectRatioFit };