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
        this.element = core.dom.intro;

        if ( this.element.length ) {
            this.logTime = Date.now();
            this.minTime = 4000;
            this.blit = new Controller();
            this.setTime();
            this.animIn();
        }
    },

    animIn () {
        this.element.find( ".js-intro-anim" ).addClass( "is-animated" );
    },

    setTime () {
        let timeout = null;
        const timeElem = this.element.find( ".js-intro-time" );
        const timeTicker = () => {
            clearTimeout( timeout );

            const theDate = new Date();
            const theHours = theDate.getHours();
            const theMinutes = theDate.getMinutes();
            const theSeconds = theDate.getSeconds();
            const fixHours = theHours > 12 ? theHours - 12 : theHours;
            const fixMinutes = theMinutes < 10 ? `0${theMinutes}` : theMinutes;
            const fixSeconds = theSeconds < 10 ? `0${theSeconds}` : theSeconds;

            timeElem[ 0 ].innerHTML = `${fixHours}:${fixMinutes}:${fixSeconds}`;
            timeout = setTimeout( timeTicker, 100 );
        };

        timeTicker();
    },

    teardown () {
        this.blit.go(() => {
            if ( (Date.now() - this.logTime) > this.minTime ) {
                this.blit.stop();
                core.dom.html.removeClass( "is-intro" );
                core.emitter.fire( "app--intro-teardown" );
            }
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
