import * as core from "../core";
import Controller from "properjs-controller";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 *
 */
const intro = {
    init () {
        this.logTime = Date.now();
        this.minTime = 3000;
        this.blit = new Controller();
    },
    teardown () {
        this.blit.go(() => {
            if ( (Date.now() - this.logTime) > this.minTime ) {
                this.blit.stop();
                core.dom.intro.removeClass( "is-active" );
                core.emitter.fire( "app--intro-teardown" );
            }
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
