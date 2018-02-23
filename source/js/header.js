import * as core from "./core";
import $ from "properjs-hobo";
import paramalama from "paramalama";


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
        this.footer = core.dom.body.find( ".js-footer" );

        if ( this.element.length ) {
            this.data = this.element.data();
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.navi = this.element.find( ".js-navi" );

            this.load().then(() => {
                this.bind();
            });
        }
    },


    load () {
        return new Promise(( resolve ) => {
            const query = paramalama( window.location.search );

            query.format = "json";

            $.ajax({
                url: this.data.root,
                data: query,
                dataType: "json",
                method: "GET"

            }).then(( json ) => {
                this.categoryMenu[ 0 ].innerHTML = `
                    <a class="menu__a menu__a--everything js-menu-category js-menu--everything p a a--grey ${json.categoryFilter ? "" : "is-active"}" href="${json.collection.fullUrl}">Everything</a>
                    ${json.collection.categories.map(( category ) => {
                        return `<a class="menu__a menu__a--${category.toLowerCase()} js-menu-category js-menu--${category.toLowerCase()} p a a--grey ${json.categoryFilter && json.categoryFilter === category ? "is-active" : ""}" href="${json.collection.fullUrl}?category=${category}">${category}</a>`;

                    }).join( "" )}
                `;
                this.categories = this.element.find( ".js-menu-category" );
                this.close = this.element.find( ".js-navi-close" );
                this.close[ 0 ].href = this.data.root;
                resolve( json );
            });
        });
    },


    bind () {
        this.element.on( "click", ".js-menu-category, .js-navi-a", ( e ) => {
            const elem = $( e.target );

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );
        });

        this.element.on( "click", ".js-navi-a", () => {
            this.outro();
        });
    },


    intro () {
        this.element.removeClass( "is-animated-out" ).addClass( "is-animated" );
    },


    outro () {
        this.element.addClass( "is-animated-out" );
    },


    update ( view, params ) {
        if ( this.element.length ) {
            const elem = params.category ? this.categories.filter( `.js-menu--${params.category.toLowerCase()}` ) : this.categories.filter( ".js-menu--everything" );
            const article = core.dom.body.find( ".js-article" );

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );

            if ( article.length ) {
                this.setTitle( article );
            }
        }
    },


    setTitle ( article ) {
        const data = article.data();

        this.titleMenu[ 0 ].innerHTML = `
            <div class="menu__title p">${data.title}</div>
            <div class="menu__meta p -grey">${data.category}</div>
        `;
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default header;
