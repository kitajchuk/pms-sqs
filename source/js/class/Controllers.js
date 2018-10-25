import * as core from "../core";
import ImageController from "./controllers/ImageController";
import AnimateController from "./controllers/AnimateController";
import PlaylistController from "./controllers/PlaylistController";
import VideoController from "./controllers/VideoController";
import OverlapController from "./controllers/OverlapController";
import LoadmoreController from "./controllers/LoadmoreController";
import RelatedController from "./controllers/RelatedController";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.element = options.el;
        this.callback = options.cb;
        this.controllers = [];
    }


    push ( id, elements, controller, conditions ) {
        this.controllers.push({
            id: id,
            elements: elements,
            instance: null,
            Controller: controller,
            conditions: conditions
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length && controller.conditions ) {
                controller.instance = new controller.Controller( controller.elements );
            }
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];
    }


    exec () {
        this.controllers = [];

        this.push( "playlist", core.dom.body.find( ".js-playlist" ), PlaylistController, true );
        this.push( "video", core.dom.body.find( ".sqs-block-video" ), VideoController, true );
        this.push( "overlap", core.dom.body.find( ".js-overlap" ), OverlapController, (!core.detect.isDevice()) );
        this.push( "loadmore", core.dom.body.find( ".js-loadmore" ), LoadmoreController, true );
        this.push( "related", core.dom.body.find( ".js-related" ), RelatedController, true );

        this.anims = this.element.find( core.config.lazyAnimSelector );
        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.animController = new AnimateController( this.anims );
        this.imageController.on( "preloaded", () => {
            this.init();

            if ( this.callback ) {
                this.callback();
            }
        });
    }


    animate () {
        this.animController.start();
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        if ( this.animController ) {
            this.animController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
