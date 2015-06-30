/*!
 *
 * App Module: /collection
 *
 * A nice description of what this module does...
 *
 *
 */
import { emitter, loadImages, isImageLoadable, resizeElems } from "app/util";


var $_jsCollections = $( ".js-collection" ),



collection = {
    init: function () {
        emitter.on( "app--scroll", onScroller );

        onScroller();

        console.log( "collection initialized" );
    },


    getCollection: function ( element ) {
        var data = element.data();

        $.ajax({
            url: data.collection,
            type: "GET",
            dataType: (data.format || "html"),
            data: (data.format === "json" ? {format: "json"} : null)

        })
        .done(function ( response ) {
            var $content,
                $collection,
                $tiles;

            if ( data.format === "json" ) {
                $tiles = $( response.mainContent );

            } else {
                $content = $( response );
                $collection = $content.find( ".js-collection-list" );
                $tiles = $collection.children();
            }

            element.append( $tiles );

            resizeElems();
            loadImages( element.find( ".js-lazy-image" ), isImageLoadable );
        })
        .fail(function (  xhr, status, error  ) {
            console.log( "fail: ", error );
        });
    }
},


onScroller = function ( scrollPos ) {
    $_jsCollections.not( ".is-collected" ).each(function () {
        var $this = $( this );

        if ( ($this.offset().top < (scrollPos + window.innerHeight)) ) {
            $this.addClass( "is-collected" );

            collection.getCollection( $this );
        }
    });
};


/******************************************************************************
 * Export
*******************************************************************************/
export default collection;