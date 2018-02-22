// import Stagger from "properjs-stagger";
import ScrollController from "properjs-scrollcontroller";
import * as core from "../core";
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
        this.start();
    }


    /**
     *
     * @instance
     * @description Initialize the animation frame
     * @memberof AnimateController
     * @method start
     *
     */
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
        let lastTime = Date.now();
        let currElem = 0;

        animator.go(() => {
            const currTime = Date.now();

            if ( currElem === elems.length ) {
                animator.stop();
                core.log( "[AnimateController] Animation Complete!" );

            } else if ( (currTime - lastTime) >= 100 ) {
                lastTime = currTime;
                elems[ currElem ].className += ` ${this.className}`;
                currElem++;
            }
        });
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof AnimateController
     * @method destroy
     *
     */
    destroy () {
        const visible = core.util.getElementsInView( this.elements );

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
