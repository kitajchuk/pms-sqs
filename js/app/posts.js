/*!
 *
 * App Module: /posts
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/dom";
import "app/loader";
import "app/gallery";
import { duration2 } from "app/config";
import { scroller, emitter, loadImages, isImageLoadable, resizeElems, toggleMouseWheel } from "app/util";


var $_jsPosts = dom.page.find( ".js-posts" ),
    $_jsArticles = dom.page.find( ".js-article" ),

    debounce = require( "debounce" ),
    Easing = require( "Easing" ),
    scroll2 = require( "scroll2" ),

    _pageData = null,
    _isFinished = false,
    _isLoading = false,
    _isLoaded = false,
    _isActive = false,


posts = {
    init: function () {
        console.log( "posts initialized" );
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

        _isLoaded = true;
        _pageData = $_jsPosts.data();
        _isFinished = _pageData.nextPage ? false : true;

        if ( _pageData.nextPage ) {
            emitter.on( "app--scroll", onScrollStart );
            emitter.on( "app--scroll", onScrollEnd );
        }
    },


    unload: function () {
        if ( _isLoaded ) {
            this.teardown();
        }
    },


    getElements: function () {
        $_jsPosts = dom.page.find( ".js-posts" );
        $_jsArticles = dom.page.find( ".js-article" );

        return ( $_jsPosts.length );
    },


    teardown: function () {
        _isActive = false;
        _isLoaded = false;
        _pageData = null;
        _isFinished = false;
        _isLoading = false;

        $_jsPosts = null;
        $_jsArticles = null;

        emitter.off( "app--scroll", onScrollStart );
        emitter.off( "app--scroll", onScrollEnd );
    }
},


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

        gallery.getElements();
        gallery.loadAll();
        emitter.fire( "app--load-audio" );
        emitter.fire( "app--load-video" );

        resizeElems();
        loadImages( null, isImageLoadable );

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


isLoadable = function () {
    // 0.0 Scroll has reached document end
    // 0.1 We have not incremented to all loaded count
    // 0.2 We are not actively staging/loading in new content
    return (($_jsArticles.last().offset().top < (scroller.getScrollY() + window.innerHeight)) && !_isFinished && !_isLoading);
},


resetLoadable = function () {
    _isLoading = false;

    loader.resetLoadable();
},


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
export default posts;