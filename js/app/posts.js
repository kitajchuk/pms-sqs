/*!
 *
 * App Module: /posts
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/loader";
import "app/gallery";
import { duration2 } from "app/config";
import { emitter, scroller, loadImages, onImageLoadHandler, resizeElements, toggleMouseWheel } from "app/util";


var $_jsPosts = $( ".js-posts" ),
    $_jsArticles = $( ".js-article" ),

    debounce = require( "debounce" ),
    Easing = require( "Easing" ),
    scroll2 = require( "scroll2" ),

    _pageData = $_jsPosts.data(),
    _isFinished = false,
    _isLoading = false,


/** BEGIN: CORE MODULE REQUIRED **/
    _isLoaded = false,
    _isActive = false,


/**
 *
 * Module defined name
 * @member name
 * @memberof posts
 *
 */
name = "posts",


/**
 *
 * Module isActive method
 * @method isActive
 * @returns number
 * @memberof posts
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
 * @memberof posts
 *
 */
isLoaded = function () {
    return _isLoaded;
},


/**
 *
 * Module onload method
 * @method onload
 * @memberof posts
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
    if ( $_jsPosts.length ) {
        _isLoaded = true;
        _pageData = $_jsPosts.data();
        _isFinished = _pageData.nextPage ? false : true;
    
        if ( _pageData.nextPage ) {
            scroller.on( "scroll", onScrollStart );
            scroller.on( "scroll", onScrollEnd );
        }
    }

    console.log( "[posts module onload]" );
},


/**
 *
 * Module unload method
 * @method unload
 * @memberof posts
 *
 */
unload = function () {
    _isActive = false;
    _isLoaded = false;
    _pageData = null;
    _isFinished = false;
    _isLoading = false;

    scroller.off( "scroll", onScrollStart );
    scroller.off( "scroll", onScrollEnd );

    console.log( "[posts module unload]" );
},


/**
 *
 * Module getSetElements method, queries DOM
 * @method getSetElements
 * @returns number
 * @memberof posts
 *
 */
getSetElements = function () {
    $_jsPosts = $( ".js-posts" );
    $_jsArticles = $( ".js-article" );

    return ( $_jsPosts.length );
},
/** END: CORE MODULE REQUIRED **/


/**
 *
 * Module getNewLoad method, requests next page of posts
 * @method getNewLoad
 * @memberof posts
 *
 */
getNewLoad = function () {
    if ( _isLoading ) {
        return;
    }

    // Flag the is-loading state
    _isLoading = true;

    $.ajax({
        url: _pageData.nextPageUrl,
        type: "GET",
        dataType: "html"

    })
    .done(function ( html ) {
        var $page = $( html ),
            $posts = $page.find( ".js-posts" ),
            $articles = $posts.children(),
            data = $posts.data();

        if ( !data.nextPage ) {
            _isFinished = true;
            console.log( "All posts loaded" );

        } else {
            _pageData = data;
        }

        $_jsPosts.append( $articles );

        $_jsArticles = $articles;

        gallery.loadAll();
        emitter.fire( "load-audio-content" );
        emitter.fire( "load-video-content" );

        resizeElements();
        loadImages( null, onImageLoadHandler );

        loader.stopLoading();

        setTimeout(function () {
            resetLoadable();

            scroll2({
                y: $articles.offset().top,
                ease: Easing.easeOutCubic,
                duration: 1000,
                complete: function () {
                    toggleMouseWheel( true );
                }
            });

        }, duration2 );
    })
    .fail(function (  xhr, status, error  ) {
        console.log( "fail: ", error );
    });
},





/**
 *
 * Module isLoadable method, can we load more or not
 * @method isLoadable
 * @returns boolean
 * @memberof posts
 *
 */
isLoadable = function () {
    // 0.0 Scroll has reached document end
    // 0.1 We have not incremented to all loaded count
    // 0.2 We are not actively staging/loading in new content
    return (($_jsArticles.last().offset().top < (scroller.getScrollY() + window.innerHeight)) && !_isFinished && !_isLoading);
},


/**
 *
 * Module resetLoadable method, reset flags for more loading
 * @method resetLoadable
 * @memberof posts
 *
 */
resetLoadable = function () {
    _isLoading = false;

    loader.resetLoadable();
},


/**
 *
 * Module onScrollStart method, debounce scroll start
 * @method onScrollStart
 * @memberof posts
 *
 */
onScrollStart = debounce(function () {
    if ( _isLoading ) {
        return;
    }

    if ( isLoadable() ) {
        toggleMouseWheel( false );
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
 * @memberof posts
 *
 */
onScrollEnd = debounce(function () {
    if ( _isLoading ) {
        return;
    }

    if ( isLoadable() ) {
        toggleMouseWheel( false );
        getNewLoad();
        loader.showLoading();

    } else {
        resetLoadable();
    }
});


/******************************************************************************
 * Export
*******************************************************************************/
export { name, onload, unload, isActive, isLoaded, getSetElements };