/*!
 *
 * App Module: /posts
 *
 * A nice description of what this module does...
 *
 *
 */
import { duration2 } from "app/config";
import { emitter, scroller, loadImages, onImageLoadHandler, resizeElements } from "app/util";


var $_jsPosts = $( ".js-posts" ),
    $_jsLoader = $( ".js-loader" ).last(),
    $_jsArticles = $( ".js-article" ),

    debounce = funpack( "debounce" ),
    Tween = funpack( "Tween" ),
    Easing = funpack( "Easing" ),

    _pageData = null,
    _isFinished = false,
    _isLoading = false,
    _tween = null,
    _isInit = false,

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
 * Module init method, called once
 * @method init
 * @memberof posts
 *
 */
init = function () {
    if ( _isInit ) {
        return;
    }

    _isInit = true;

    _pageData = $_jsPosts.data();
    _isFinished = _pageData.nextPage ? false : true;

    if ( _pageData.nextPage ) {
        scroller.on( "scroll", onScrollStart );
        scroller.on( "scroll", onScrollEnd );
    }

    console.log( "[posts module onload]" );
},


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

        resizeElements();
        loadImages( null, onImageLoadHandler );

        stopLoading();

        emitter.fire( "cycle-transition-content" );
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
        duration: 20000
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
            $_jsLoader.css( "width", t ).addClass( "is-loaded" );

            setTimeout(function () {
                $_jsLoader = $( ".js-loader" ).last();

                resetLoadable();

            }, duration2 );
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
export { name, init };