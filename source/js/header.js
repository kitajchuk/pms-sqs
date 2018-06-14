import * as core from "./core";
import $ from "properjs-hobo";
import paramalama from "paramalama";
import info from "./info";
import viewCats from "./views/cats";


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

        if ( this.element.length ) {
            this.info = this.element.find( ".js-navi-info" );
            this.data = this.element.data();
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.navi = this.element.find( ".js-navi" );
            this.returner = this.element.find( ".js-navi-returner" );
            this.ender = this.element.find( ".js-navi-ender" );
            this.returner[ 0 ].href = this.data.root;
            this.mobileCategory = this.element.find( ".js-navi-mobile-category" );
            this.defaultCategory = "everything";
            this._isNaviOpen = false;

            this.load().then(( json ) => {
                this.json = json;
                this.done();
                this.bind();
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
            }
        });

        this.element.on( "click", ".js-navi-ender", () => {
            if ( info.isOpen() ) {
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
