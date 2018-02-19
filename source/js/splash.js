import * as core from "./core";


/**
 *
 * @public
 * @namespace splash
 * @description Performs the splash page logix.
 *
 */
const splash = {
    init () {
        this.element = core.dom.body.find( ".js-splash" );

        if ( this.element.length ) {
            this.fourTwenty();
        }
    },


    fourTwenty () {
        let timeout = null;
        const fourTwenty = this.element.find( "em" );
        const tickFourTwenty = () => {
            clearTimeout( timeout );

            const theDate = new Date();
            const theMinutes = theDate.getMinutes();
            const theHours = theDate.getHours();
            const theSplit = theHours >= 12 ? "PM" : "AM";
            const fixHours = theHours > 12 ? theHours - 12 : theHours;
            const fixMinutes = theMinutes < 10 ? `0${theMinutes}` : theMinutes;

            fourTwenty[ 0 ].innerHTML = `${fixHours}:${fixMinutes}${theSplit}`;

            timeout = setTimeout( tickFourTwenty, 10000 );
        };

        tickFourTwenty();
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default splash;
