import * as core from "../../core";



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
        this.media = this.element.find( ".js-overlap-media" );
        this.text = this.element.find( ".js-overlap-text" );
        this.isCollider = false;

        this.bind();
    }


    bind () {
        this.element.on( "mousemove", ( e ) => {
            const mediaBounds = this.media[ 0 ].getBoundingClientRect();
            const clientBounds = {
                x: e.clientX,
                y: e.clientY,
                width: 0,
                height: 0
            };

            if ( core.util.rectsCollide( mediaBounds, clientBounds ) && !this.isCollider ) {
                this.isCollider = true;
                this.element.addClass( "is-collider" );

            } else if ( !core.util.rectsCollide( mediaBounds, clientBounds ) && this.isCollider ) {
                this.isCollider = false;
                this.element.removeClass( "is-collider" );
            }
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
