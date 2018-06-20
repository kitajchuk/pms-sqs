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
        this.content = core.dom.body.find( ".js-info-content" );

        if ( this.element.length ) {
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
    },


    close () {
        this._isOpen = false;
        this.element.removeClass( "is-active" );
        core.dom.html.removeClass( "is-info-open" );
    },


    isOpen () {
        return this._isOpen;
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default info;
