/*!
 *
 * App Module: /posts
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/gallery";
import { duration2 } from "app/config";
import { emitter, scroller, loadImages, onImageLoadHandler, resizeElements } from "app/util";


var $_jsPosts = $( ".js-posts" ),
    $_jsArticles = $( ".js-article" ),
    $_jsLoader = $( ".js-loader" ),

    debounce = funpack( "debounce" ),
    Tween = funpack( "Tween" ),
    Easing = funpack( "Easing" ),
    scroll2 = funpack( "scroll2" ),

    _pageData = $_jsPosts.data(),
    _isFinished = false,
    _isLoading = false,
    _tween = null,


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
    _tween = null;
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
    $_jsLoader = $( ".js-loader" );
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

        stopLoading();

        setTimeout(function () {
            scroll2({
                y: $articles.offset().top,
                ease: Easing.easeOutCubic,
                duration: 1000
            });

        }, duration2 );
    })
    .fail(function (  xhr, status, error  ) {
        console.log( "fail: ", error );
    });
},


/**
 *
 * Module showLoading method, animate loading bar
 * @method showLoading
 * @memberof posts
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
 * @memberof posts
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

    $_jsLoader.removeClass( "is-loading" );

    setTimeout(function () {
        $_jsLoader.attr( "style", "" );

    }, duration2 );
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
        getNewLoad();
        showLoading();

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
        getNewLoad();
        showLoading();

    } else {
        resetLoadable();
    }
});


/******************************************************************************
 * Export
*******************************************************************************/
export { name, onload, unload, isActive, isLoaded, getSetElements };