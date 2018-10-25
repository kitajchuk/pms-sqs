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
        this.pms = "PAPERMAKESTACK".split( "" ).reverse();
        this.duration = 150;

        if ( this.element.length ) {
            this.exec();
        }
    },

    exec () {
        const _exec = ( letter ) => {
            this.press[ 0 ].innerHTML = letter;

            setTimeout(() => {
                if ( !this.pms.length ) {
                    this.teardown();

                } else {
                    _exec( this.pms.pop() );
                }

            }, this.duration );
        };

        _exec( this.pms.pop() );
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
