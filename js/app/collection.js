/*!
 *
 * App Module: /collection
 *
 * A nice description of what this module does...
 *
 *
 */
import { scroller, loadImages, onImageLoadHandler, resizeElements } from "app/util";


var $_jsCollections = $( ".js-collection" ),

    _isInit = false,


name = "collection",



/**
 *
 * Module init method, called once
 * @method init
 * @memberof collection
 *
 */
init = function () {
    if ( _isInit ) {
        return;
    }

    _isInit = true;

    scroller.on( "scroll", onScroller );

    onScroller();

    console.log( "[collection module init]" );
},


/**
 *
 * Module getCollection method, requests next page of collections
 * @method getCollection
 * @param {object} $elem The jQuery object
 * @memberof collection
 *
 */
getCollection = function ( $elem ) {
    $.ajax({
        url: $elem.data( "collection" ),
        type: "GET",
        dataType: "html"

    })
    .done(function ( html ) {
        var $page = $( html ),
            $collection = $page.find( ".js-collection-list" ),
            $tiles = $collection.children();

        $elem.append( $tiles );

        resizeElements();
        loadImages( $elem.find( ".js-lazy-image" ), onImageLoadHandler );
    })
    .fail(function (  xhr, status, error  ) {
        console.log( "fail: ", error );
    });
},


/**
 *
 * Module onScroller method, debounce scroll end
 * @method onScroller
 * @memberof collection
 *
 */
onScroller = function () {
    $_jsCollections.not( ".is-collected" ).each(function () {
        var $this = $( this );

        if ( ($this.offset().top < (scroller.getScrollY() + (window.innerHeight * 2))) ) {
            $this.addClass( "is-collected" );

            getCollection( $this );
        }
    });
};


/******************************************************************************
 * Export
*******************************************************************************/
export { name, init, getCollection };