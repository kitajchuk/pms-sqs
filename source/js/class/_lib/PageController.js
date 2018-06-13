import * as core from "../core";
import header from "../header";
// import router from "../router";


/**
 *
 * @public
 * @global
 * @class PageController
 * @classdesc Handle a basic web page.
 *
 */
class PageController {
    constructor ( element ) {
        this.element = element;

        core.dom.html.addClass( "is-page-black" );
        this.element.addClass( "is-animated" );
        header.footerIn();
    }

    destroy () {
        core.dom.html.removeClass( "is-page-black" );
        this.element.addClass( "is-animated-out" );
        header.animIn();
        header.footerOut();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default PageController;
