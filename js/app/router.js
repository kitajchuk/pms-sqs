/*!
 *
 * App Controller: router
 *
 * A nice description of what this controller does...
 *
 *
 */
import { resizeElems, getTransitionDuration } from "app/util";
import "app/dom";
import "app/posts";
import "app/overlay";
import "app/actions";
import "app/gallery";
import "app/scrolls";
import "app/gallery";


var PageController = require( "PageController" ),

    _pageDuration = getTransitionDuration( dom.page[ 0 ] ),
    _pageController = new PageController({
        anchorTop: false,
        transitionTime: _pageDuration
    }),


router = {
    init: function () {
        _pageController.setConfig([
            "*"
        ]);

        _pageController.setModules([
            scrolls,
            gallery,
            posts
        ]);

        _pageController.initPage();

        _pageController.on( "page-controller-router-transition-out", function ( data ) {
            changePageOut( data );
        });

        _pageController.on( "page-controller-router-transition-in", function ( data ) {
            changePageIn( data );
        });

        captureLinks();

        console.log( "router initialized" );
    }
},


captureLinks = function () {
    // Suppress #hash
    dom.body.on( "click", "[href='#']", function ( e ) {
        e.preventDefault();
        return false;
    });
},


changePageOut = function () {
    dom.page.removeClass( "is-reactive" ).addClass( "is-inactive" );
},


changePageIn = function ( data ) {
    var $doc = $( data.response ),
        res = $doc.find( ".js-module" )[ 0 ].innerHTML;

    document.title = $doc.filter( "title" ).text();

    dom.module[ 0 ].innerHTML = res;
    dom.page.addClass( "is-reactive" );

    resizeElems();

    if ( overlay.isOpen() ) {
        overlay.close();
    }

    actions.doPageviewAction( dom.module[ 0 ].id );
    actions.doScrollerAction();
    actions.doSquarespaceVideoAction();
    actions.doSquarespaceAudioAction();
    actions.doImageLoadAction();

    setTimeout(function () {
        dom.page.removeClass( "is-reactive is-inactive" );

    }, _pageDuration );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default router;