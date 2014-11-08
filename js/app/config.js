/*!
 *
 * App Module: /config
 *
 * @namespace config
 * @memberof app
 *
 */


/**
 *
 * Base transition duration
 * @member duration1
 * @memberof config
 *
 */
var duration1 = 400,


/**
 *
 * Base transition duration
 * @member duration2
 * @memberof config
 *
 */
duration2 = 600,


/**
 *
 * Base transition duration
 * @member duration3
 * @memberof config
 *
 */
duration3 = 800,


/**
 *
 * Max width for site container
 * @member gridMaxWidth
 * @memberof config
 *
 */
gridMaxWidth = 1480,


/**
 *
 * Post feature display aspect ratio
 * @member postAspect
 * @memberof config
 *
 */
postAspect = (1476 / 827),


/**
 *
 * Feature image display aspect ratio
 * @member featureAspect
 * @memberof config
 *
 */
featureAspect = (1500 / 900),


/**
 *
 * Vendor prefix for styles
 * @member cssTransform
 * @memberof config
 *
 */
cssTransform = (function ( vendors ) {
    var prefix;

    for ( var i = 0, len = vendors.length; i < len; i++ ) {
        if ( document.body.style[ (vendors[ i ] + "Transform") ] !== undefined ) {
            prefix = vendors[ i ];
            break;
        }
    }

    return (prefix + "Transform");

})( [ "Webkit", "Moz", "O", "ms" ] );


/******************************************************************************
 * Export
*******************************************************************************/
export { duration1, duration2, duration3, gridMaxWidth, postAspect, featureAspect, cssTransform };