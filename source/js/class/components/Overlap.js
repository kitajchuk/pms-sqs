import * as core from "../../core";
import ScrollController from "properjs-scrollcontroller";



/**
 *
 * @public
 * @global
 * @class Overlap
 * @classdesc Handle media overlap hovers.
 *
 */
class Overlap {
    constructor ( element ) {
        this.element = element;
        this.data = element.data();
        this.media = this.element.find( ".js-overlap-media" );
        this.text = this.element.find( ".js-overlap-text" );
        this.isCollider = false;
        this.scroller = new ScrollController();

        this.bind();
    }


    bind () {
        this.element.on( "mousemove", ( e ) => {
            const mediaBounds = this.media[ 0 ].getBoundingClientRect();
            const textBounds = this.text[ 0 ].getBoundingClientRect();
            const compareBounds = (this.data.flip ? textBounds : mediaBounds);
            const clientBounds = {
                x: e.clientX,
                y: e.clientY,
                width: 0,
                height: 0
            };

            if ( core.util.rectsCollide( compareBounds, clientBounds ) && !this.isCollider ) {
                this.isCollider = true;
                this.element.addClass( "is-collider" );

            } else if ( !core.util.rectsCollide( compareBounds, clientBounds ) && this.isCollider ) {
                this.isCollider = false;
                this.element.removeClass( "is-collider" );
            }
        });

        this.element.on( "mouseleave", () => {
            this.isCollider = false;
            this.element.removeClass( "is-collider" );
        });

        this.scroller.on( "scroll", () => {
            this.isCollider = false;
            this.element.removeClass( "is-collider" );
        });
    }


    destroy () {
        this.element.off();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Overlap;
