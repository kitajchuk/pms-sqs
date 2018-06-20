import * as core from "../core";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 *
 */
const intro = {
    exec () {
        return new Promise(( resolve ) => {
            setTimeout(() => {
                core.dom.intro.removeClass( "is-active" );

                resolve();

                core.emitter.fire( "app--intro-teardown" );

            }, 2000 );
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
