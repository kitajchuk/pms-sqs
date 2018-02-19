import * as core from "./core";


/**
 *
 * @public
 * @namespace navi
 * @description Performs the nav stuff.
 *
 */
const navi = {
    init () {
        this.element = core.dom.body.find( ".js-header" );

        if ( this.element.length ) {
            this.data = this.element.data();
            this.categories = this.element.find( ".js-menu-a" );
            this.close = this.element.find( ".js-navi--close" );
            this.close[ 0 ].href = this.data.root;
            this.title = this.element.find( ".js-menu--title" );
        }
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

        this.title[ 0 ].innerHTML = `
            <div class="menu__title p">${data.title}</div>
            <div class="menu__meta p -grey">${data.category}</div>
        `;
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navi;
