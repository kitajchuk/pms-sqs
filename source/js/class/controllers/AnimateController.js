import ScrollController from "properjs-scrollcontroller";
import * as core from "../../core";
import Controller from "properjs-controller";


/**
 *
 * @public
 * @global
 * @class AnimateController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class AnimateController {
    constructor ( elements ) {
        this.className = "is-animated";
        this.classNameOut = "is-animated-out";
        this.elements = elements;
    }


    start () {
        this.scroller = new ScrollController();
        this.scroller.on( "scroll", () => {
            this.handle();
        });

        this.handle();
    }


    handle () {
        this.elements = core.dom.main.find( core.config.lazyAnimSelector ).not( "[data-animate='true']" );

        if ( !this.elements.length ) {
            this.scroller.stop();
            this.scroller = null;

            core.log( "[AnimateController] Done!" );

        } else {
            const visible = core.util.getElementsInView( this.elements );

            if ( visible.length ) {
                this.animate( visible );
            }
        }
    }


    animate ( elems ) {
        elems.attr( "data-animate", "true" );

        // Sequence the animation of the elements
        const animator = new Controller();
        let currElem = 0;

        animator.go(() => {
            if ( currElem === elems.length ) {
                animator.stop();
                core.log( "[AnimateController] Animation Complete!" );

            } else {
                elems[ currElem ].className += ` ${this.className}`;
                currElem++;
            }
        });
    }


    destroy () {
        const visible = core.util.getElementsInView( core.dom.main.find( core.config.lazyAnimSelector ) );

        if ( visible.length ) {
            visible.addClass( this.classNameOut );
        }

        if ( this.scroller ) {
            this.scroller.destroy();
            this.scroller = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default AnimateController;
