import $ from "properjs-hobo";
import * as core from "../../core";
import viewRelated from "../../views/related";

/**
 *
 * @public
 * @global
 * @class RelatedController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle loading related articles.
 *
 */
class RelatedController {
    constructor ( element ) {
        this.max = 6;
        this.element = element;
        this.data = this.element.data();

        this.load();
        this.bind();
    }


    bind () {}


    load () {
        $.ajax({
            url: this.data.collection.fullUrl,
            dataType: "json",
            method: "GET",
            data: {
                format: "json"
            }

        }).then(( json ) => {
            this.items = core.util.shuffle(json.items.filter(( item ) => {
                return (item.categories.indexOf( this.data.category ) !== -1 && item.id !== this.data.item.id);

            })).slice( 0, this.max );

            this.element[ 0 ].innerHTML = viewRelated( this.data.collection, this.data.category, this.items );

            core.util.loadImages( this.element.find( core.config.lazyImageSelector ) );

        }).catch(( error ) => {
            core.log( error );
        });
    }


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default RelatedController;
