import * as core from "../core";
import $ from "properjs-hobo";


/**
 *
 * @public
 * @namespace info
 * @description Performs the nav stuff.
 *
 */
const info = {
    init () {
        this.element = core.dom.body.find( ".js-info" );
        this.stamp = this.element.find( ".js-info-stamp" );

        if ( this.element.length ) {
            this.content = core.dom.body.find( ".js-info-content" );
            this.data = this.element.data();

            this.load().then(( json ) => {
                this.json = json;
                this.done();
            });
        }
    },


    load () {
        return $.ajax({
            url: this.data.root,
            data: {
                format: "json"
            },
            dataType: "json",
            method: "GET"
        });
    },


    done () {
        this.content[ 0 ].innerHTML = `${this.json.mainContent}`;
    },


    open () {
        this._isOpen = true;
        this.element.addClass( "is-active" );
        core.dom.html.addClass( "is-info-open" );
        this.setStamp();
    },


    close () {
        this._isOpen = false;
        this.element.removeClass( "is-active" );
        core.dom.html.removeClass( "is-info-open" );
    },


    isOpen () {
        return this._isOpen;
    },

    setStamp () {
        const theDate = new Date();
        const theMinutes = theDate.getMinutes();
        const theHours = theDate.getHours();
        const theSplit = theHours >= 12 ? "PM" : "AM";
        const fixHours = theHours > 12 ? theHours - 12 : theHours;
        const fixMinutes = theMinutes < 10 ? `0${theMinutes}` : theMinutes;

        this.stamp[ 0 ].innerHTML = `${fixHours}:${fixMinutes}${theSplit}`;
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default info;
