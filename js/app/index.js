/*!
 *
 * App Module: /index
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/loader";
import { duration2 } from "app/config";
import { scroller, loadImages, toggleMouseWheel, toggleTouchMove } from "app/util";


var $_jsIndex = $( ".js-index" ),

    //debounce = require( "debounce" ),
    Easing = require( "Easing" ),
    scroll2 = require( "scroll2" ),
    debounce = require( "debounce" ),

    _isFinished = false,
    _isLoading = false,


/** BEGIN: CORE MODULE REQUIRED **/
    _isLoaded = false,
    _isActive = false,


name = "index",


/**
 *
 * Module isActive method
 * @method isActive
 * @returns number
 * @memberof index
 *
 */
isActive = function () {
    return _isActive;
},


/**
 *
 * Module isLoaded method
 * @method isLoaded
 * @returns boolean
 * @memberof index
 *
 */
isLoaded = function () {
    return _isLoaded;
},


/**
 *
 * Module onload method
 * @method onload
 * @memberof index
 *
 */
onload = function () {
    _isActive = getSetElements();

    if ( _isLoaded ) {
        return;

    } else if ( !_isActive ) {
        return;
    }

    // Post list
    if ( $_jsIndex.length ) {
        _isLoaded = true;
    
        scroller.on( "scroll", onScrollStart );
        scroller.on( "scroll", onScrollEnd );

        getNewLoad( $_jsIndex );
    }

    console.log( "[index module onload]" );
},


/**
 *
 * Module unload method
 * @method unload
 * @memberof index
 *
 */
unload = function () {
    _isActive = false;
    _isLoaded = false;
    _isFinished = false;
    _isLoading = false;

    scroller.off( "scroll", onScrollStart );
    scroller.off( "scroll", onScrollEnd );

    console.log( "[index module unload]" );
},


/**
 *
 * Module getSetElements method, queries DOM
 * @method getSetElements
 * @returns number
 * @memberof index
 *
 */
getSetElements = function () {
    $_jsIndex = $( ".js-index" );

    return ( $_jsIndex.length );
},
/** END: CORE MODULE REQUIRED **/


/**
 *
 * Module buildIndex method, requests next set of content
 * @method buildIndex
 * @param {object} data The json to build with
 * @memberof index
 *
 */
buildIndex = function ( data ) {
    var tiles = "";

    for ( var i = 0, len = data.items.length; i < len; i++ ) {
        var item = data.items[ i ];

        tiles += '<a class="index__item column--4of12 flex--4of12" href="' + item.fullUrl + '">';
        tiles += '    <div class="figure">';
        tiles += '        <div class="figure__image image image--cinema js-lazy-image -cover" data-img-src="' + item.assetUrl + '" data-variants="' + item.systemDataVariants + '"></div>';
        tiles += '    </div>';
        tiles += '</a>';
    }

    return $( tiles );
},


/**
 *
 * Module isLoadable method, can we load more or not
 * @method isLoadable
 * @returns boolean
 * @memberof index
 *
 */
isLoadable = function () {
    var scrollY = scroller.getScrollY(),
        offsetBot = $_jsIndex.offset().top + $_jsIndex.outerHeight();

    // 0.0 Scroll has reached document end
    // 0.1 We have not incremented to all loaded count
    // 0.2 We are not actively staging/loading in new content
    return ((offsetBot <= (scrollY + window.innerHeight)) && !_isFinished && !_isLoading);
},


/**
 *
 * Module getNewLoad method, requests next page of indexs
 * @method getNewLoad
 * @memberof index
 *
 */
getNewLoad = function () {
    var data = $_jsIndex.data();

    // Flag the is-loading state
    _isLoading = true;

    $.ajax({
        url: data.pagination ? data.pagination.nextPageUrl : data.collection,
        type: "GET",
        dataType: "json",
        data: {
            format: "json"
        }

    })
    .done(function ( response ) {
        var $tiles;

        // Firat pass
        if ( !data.pagination ) {
            resetLoadable();

            $tiles = buildIndex( response );

            $_jsIndex.append( $tiles );

            $_jsIndex.data( "pagination", response.pagination );

            loadImages( $tiles.find( ".js-lazy-image" ), function () { return true; } );

        } else {
            if ( !data.pagination.nextPage ) {
                _isFinished = true;
                resetLoadable();
                toggleMouseWheel( true );
                toggleTouchMove( true );
                loader.stopLoading();
                console.log( "All indexes loaded" );

            } else {
                $_jsIndex.data( "pagination", response.pagination );

                $tiles = buildIndex( response );

                $_jsIndex.append( $tiles );

                loader.stopLoading();

                setTimeout(function () {
                    resetLoadable();
                    loadImages( $tiles.find( ".js-lazy-image" ), function () { return true; } ).on( "done", function () {
                        scroll2({
                            y: $tiles.offset().top,
                            ease: Easing.easeOutCubic,
                            duration: 1000,
                            complete: function () {
                                toggleMouseWheel( true );
                                toggleTouchMove( true );
                            }
                        });
                    });

                }, duration2 );
            }
        }

    })
    .fail(function (  xhr, status, error  ) {
        console.log( "fail: ", error );
    });
},


/**
 *
 * Module onScrollStart method, debounce scroll start
 * @method onScrollStart
 * @memberof index
 *
 */
onScrollStart = debounce(function () {
    if ( _isLoading ) {
        return;
    }

    if ( isLoadable() ) {
        toggleMouseWheel( false );
        toggleTouchMove( false );
        getNewLoad();
        loader.showLoading();

    } else {
        resetLoadable();
    }

}, 100, true ),


/**
 *
 * Module onScrollEnd method, debounce scroll end
 * @method onScrollEnd
 * @memberof index
 *
 */
onScrollEnd = debounce(function () {
    if ( _isLoading ) {
        return;
    }

    if ( isLoadable() ) {
        toggleMouseWheel( false );
        toggleTouchMove( false );
        getNewLoad();
        loader.showLoading();

    } else {
        resetLoadable();
    }
}),


/**
 *
 * Module resetLoadable method, reset flags for more loading
 * @method resetLoadable
 * @memberof index
 *
 */
resetLoadable = function () {
    _isLoading = false;

    loader.resetLoadable();
};


/******************************************************************************
 * Export
*******************************************************************************/
export { name, onload, unload, isActive, isLoaded, getSetElements };