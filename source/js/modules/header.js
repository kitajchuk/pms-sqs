import * as core from "../core";
import $ from "properjs-hobo";
import paramalama from "paramalama";
import info from "./info";
import viewCats from "../views/cats";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";


/**
 *
 * @public
 * @namespace header
 * @description Performs the nav stuff.
 *
 */
const header = {
    init () {
        this.element = core.dom.body.find( ".js-header" );
        this.bounds = this.element[ 0 ].getBoundingClientRect();
        this.static = 90;

        if ( this.element.length ) {
            this.info = this.element.find( ".js-navi-info" );
            this.data = this.element.data();
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.navi = this.element.find( ".js-navi" );
            this.returner = this.element.find( ".js-navi-returner" );
            this.returner[ 0 ].href = this.data.root;
            this.mobileCategory = this.element.find( ".js-navi-mobile-category" );
            this.defaultCategory = "everything";
            this._isNaviOpen = false;
            this.scroller = new ScrollController();
            this.resizer = new ResizeController();

            this.load().then(( json ) => {
                this.json = json;
                this.done();
                this.bind();
                this.watch();
            });
        }
    },


    load () {
        const query = paramalama( window.location.search );

        query.format = "json";

        return $.ajax({
            url: this.data.root,
            data: query,
            dataType: "json",
            method: "GET"
        });
    },


    done () {
        const cats = viewCats( this );

        this.categoryMenu[ 0 ].innerHTML = cats.html;
        this.categories = this.element.find( ".js-menu-category" );

        this.mobileCategory[ 0 ].innerHTML = cats.meow;
    },


    bind () {
        this.element.on( "click", ".js-menu-category", ( e ) => {
            const elem = $( e.target );
            const data = elem.data();

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );

            this.mobileCategory[ 0 ].innerHTML = data.cat;

            if ( this._isNaviOpen ) {
                this.closeNavi();
            }
        });

        this.element.on( "click", ".js-navi-info", () => {
            if ( !info.isOpen() ) {
                info.open();

            } else {
                info.close();
            }
        });

        this.element.on( "click", ".js-navi-mobile-trigger", () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();

            } else {
                this.openNavi();
            }
        });

        this.categoryMenu.on( "click", () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();
            }
        });
    },


    watch () {
        this.scroller.on( "scroll", () => {
            const scrollPos = this.scroller.getScrollY();

            if ( scrollPos >= this.bounds.height ) {
                core.dom.html.addClass( "is-header-small" );

            } else {
                core.dom.html.removeClass( "is-header-small" );
            }
        });

        this.scroller.on( "scrolldown", () => {
            core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
        });

        this.scroller.on( "scrollup", () => {
            core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
        });

        this.resizer.on( "resize", () => {
            this.bounds = this.element[ 0 ].getBoundingClientRect();
        });
    },


    update ( view, params ) {
        if ( this.element.length ) {
            const elem = params.category ? this.categories.filter( `.js-menu--${params.category.toLowerCase()}` ) : this.categories.filter( ".js-menu--everything" );

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );
        }
    },


    openNavi () {
        this._isNaviOpen = true;
        core.dom.html.addClass( "is-navi-open" );
    },


    closeNavi () {
        this._isNaviOpen = false;
        core.dom.html.removeClass( "is-navi-open" );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default header;
