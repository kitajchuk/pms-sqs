import * as core from "./core";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const intro = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.intro
     * @description Method initializes intro node in DOM.
     *
     */
    init () {
        this.element = core.dom.intro;
        this.teardown();
        // core.emitter.on( "app--page-teardown", this.teardown );
    },


    teardown () {
        core.emitter.off( "app--page-teardown", intro.teardown );

        this.timeout = setTimeout(() => {
            intro.element.removeClass( "is-active" );

            this.timeout = setTimeout(() => {
                intro.element.remove();

                core.emitter.fire( "app--intro-teardown" );

            }, core.util.getElementDuration( intro.element[ 0 ] ) );

        }, 2000 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
