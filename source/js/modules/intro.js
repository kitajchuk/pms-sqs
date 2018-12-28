import * as core from "../core";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 *
 */
const intro = {
    init () {
        this.element = core.dom.body.find( ".js-intro" );
        this.press = core.dom.body.find( ".js-intro-press" );

        if ( this.element.length ) {
            this.exec();
        }
    },

    exec () {
        setTimeout(() => {
            this.teardown();

        }, 1000 );
    },

    teardown () {
        setTimeout(() => {
            this.element.addClass( "is-pressed" );
            core.dom.html.removeClass( "is-intro" );
            core.emitter.fire( "app--intro-teardown" );

            setTimeout(() => {
                this.element.remove();

            }, 500 );

        }, 250 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
