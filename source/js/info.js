import * as core from "./core";
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

            this.load().then(() => {
                this.bind();
            });
        }
    },


    load () {
        return new Promise(( resolve ) => {
            $.ajax({
                url: this.data.root,
                data: {
                    format: "json"
                },
                dataType: "json",
                method: "GET"

            }).then(( json ) => {
                this.content[ 0 ].innerHTML = `${json.mainContent}`;
                resolve( json );
            });
        });
    },


    bind () {}
};


/******************************************************************************
 * Export
*******************************************************************************/
export default info;
