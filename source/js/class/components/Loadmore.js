import $ from "properjs-hobo";
import * as core from "../../core";
import ImageController from "../controllers/ImageController";
import AnimateController from "../controllers/AnimateController";
import OverlapController from "../controllers/OverlapController";
import ScrollController from "properjs-scrollcontroller";



/**
 *
 * @public
 * @global
 * @class Loadmore
 * @classdesc Handle feed AJAX loading.
 *
 */
class Loadmore {
    constructor ( element ) {
        this.element = element;
        this.data = this.element.data();
        this.container = core.dom.body.find( this.data.container );
        this.controllers = {};
        this.isLoading = false;

        if ( this.data.pagination ) {
            this.element.removeClass( "is-hidden" );
            this.bind();

        } else {
            this.element.addClass( "is-hidden" );
        }
    }


    bind () {
        this.scroller = new ScrollController();
        this.scroller.on( "scroll", () => {
            if ( this.scroller.isScrollMax() && !this.isLoading ) {
                this.more();
            }
        });
    }


    more () {
        this.isLoading = true;
        this.element.addClass( "is-loading" );
        this.load().then(( html ) => {
            this.exec( html );
            this.done();
        });
    }


    load () {
        return $.ajax({
            url: this.data.pagination.nextPageUrl,
            dataType: "html",
            method: "GET"
        });
    }


    exec ( html ) {
        const doc = $( html );
        const load = doc.find( this.data.container ).children();
        const images = load.find( ".js-lazy-image" );
        const overlaps = load.find( ".js-overlap" );
        const animates = load.find( ".js-lazy-anim" );

        this.data = doc.find( ".js-loadmore" ).data();
        this.container.append( load );

        this.controllers.image = new ImageController( images );
        this.controllers.image.on( "preloaded", () => {
            this.controllers.overlap = new OverlapController( overlaps );
            this.controllers.animate = new AnimateController( animates );
            this.controllers.animate.start();
        });
    }


    done () {
        this.isLoading = false;

        if ( !this.data.pagination.nextPage ) {
            this.element.remove();
            this.scroller.destroy();
        }
    }


    destroy () {
        this.element.off();

        if ( this.scroller ) {
            this.scroller.destroy();
        }

        if ( this.controllers.image ) {
            this.controllers.image.destroy();
        }

        if ( this.controllers.overlap ) {
            this.controllers.overlap.destroy();
        }

        if ( this.controllers.animate ) {
            this.controllers.animate.destroy();
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Loadmore;
