import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import viewVideo from "../views/video";


/**
 *
 * @public
 * @namespace quickview
 * @description Performs the quickview stuff.
 *
 */
const quickview = {
    init () {
        this.element = core.dom.body.find( ".js-quickview" );

        if ( this.element.length ) {
            this.ender = this.element.find( ".js-quickview-ender" );
            this.gallery = this.element.find( ".js-quickview-gallery" );
            this.navi = this.element.find( ".js-quickview-navi" );

            this.items = [];
            this.navis = [];
            this.blocks = null;
            this.article = null;
            this.currItem = null;
            this.currNavi = null;
            this.current = 0;
            this.length = 0;
            this._isTransition = false;
            this._isOpen = false;

            this.bind();
        }
    },


    bind () {
        this.ender.on( "click", () => {
            this.close();
        });

        this.element.on( "click", ( e ) => {
            const target = $( e.target );

            if ( !this._isOpen ) {
                return;
            }

            // goto
            if ( target.is( ".quickview__navi__item" ) && !this._isTransition ) {
                this.goto( target.index() );
                this.transition();

            // advance
            } else if ( e.clientX > (window.innerWidth / 2) && !this._isTransition ) {
                this.advance();
                this.transition();

            // rewind
            } else if ( e.clientX < (window.innerWidth / 2) && !this._isTransition ) {
                this.rewind();
                this.transition();
            }
        });

        core.dom.body.on( "click", ".js-quickview-hit", ( e ) => {
            const target = $( e.target );

            this.data = target.data();
            this.open();
            this.load().then(( json ) => {
                this.json = json;
                this.element.addClass( "is-loaded" );

                if ( this.json.item.body ) {
                    this.article = $( this.json.item.body );
                    this.blocks = this.article.find( ".sqs-block-image, .sqs-block-gallery, .sqs-block-video" );

                    this.build();

                } else {
                    this.gallery[ 0 ].innerHTML = `<div class="quickview__gallery__item is-empty">
                        <div class="h2">No content&hellip;</div>
                    </div>`;
                }
            });
        });
    },


    goto ( i ) {
        this.current = i;
    },


    advance () {
        this.current++;

        if ( this.current === this.length ) {
            this.current = 0;
        }
    },


    rewind () {
        this.current--;

        if ( this.current < 0 ) {
            this.current = this.length - 1;
        }
    },


    transition () {
        this._isTransition = true;

        const nextItem = this.items.eq( this.current ).addClass( "is-active" );
        const nextNavi = this.navis.eq( this.current ).addClass( "is-active" );

        this.currItem.removeClass( "is-active" );
        this.currNavi.removeClass( "is-active" );

        gsap.TweenLite.to( this.currItem[ 0 ], 0.5, {
            css: {
                opacity: 0
            },
            ease: gsap.Power4.easeOut,
            onComplete: () => {}
        });
        gsap.TweenLite.to( this.currNavi[ 0 ], 0.5, {
            css: {
                opacity: 0.3
            },
            ease: gsap.Power4.easeOut,
            onComplete: () => {}
        });
        gsap.TweenLite.to( [nextItem[ 0 ], nextNavi[ 0 ]], 0.5, {
            css: {
                opacity: 1
            },
            ease: gsap.Power4.easeIn,
            onComplete: () => {
                this._isTransition = false;
                this.currItem = nextItem;
                this.currNavi = nextNavi;
            }
        });
    },


    build () {
        this.items = [];
        this.navis = [];
        this.blocks.forEach(( el, i ) => {
            const block = this.blocks.eq( i );
            const data = block.data();
            const type = parseInt( data.blockType, 10 );

            // console.log( data, block[ 0 ].outerHTML );

            // Image // Gallery
            if ( type === 5 || type === 8 ) {
                const images = block.find( core.config.lazyImageSelector ).addClass( "quickview__media__node" );

                images.forEach(( img ) => {
                    this.navis.push( `<div class="quickview__navi__item"></div>` );
                    this.items.push( `<div class="quickview__gallery__item">${img.outerHTML}</div>` );
                });

            // Video
            } else if ( type === 32 ) {
                const image = block.find( "img" );

                this.navis.push( `<div class="quickview__navi__item"></div>` );
                this.items.push( `<div class="quickview__gallery__item">
                    ${viewVideo( data.blockJson, image.data() )}
                </div>` );
            }
        });
        this.length = this.items.length;
        this.navi[ 0 ].innerHTML = this.navis.join( "" );
        this.gallery[ 0 ].innerHTML = this.items.join( "" );
        this.navis = this.navi.find( ".quickview__navi__item" );
        this.items = this.gallery.find( ".quickview__gallery__item" );
        this.images = this.gallery.find( core.config.lazyImageSelector );
        this.currItem = this.items.first().addClass( "is-active" );
        this.currNavi = this.navis.first().addClass( "is-active" );

        core.util.loadImages( this.images, core.util.noop ).on( "done", () => {
            const timeline = new gsap.TimelineLite();

            timeline.staggerTo(
                this.navis,
                0.5,
                {
                    css: {
                        y: 0,
                        opacity: 0.3
                    },
                    ease: gsap.Power4.easeOut,
                    onComplete: () => {
                        gsap.TweenLite.to( [this.navis[ 0 ], this.items[ 0 ]], 0.5, {
                            css: {
                                opacity: 1
                            },
                            ease: gsap.Power4.easeOut,
                            onComplete: () => {}
                        });
                    }
                },
                0.05
            );
        });
    },


    load () {
        return $.ajax({
            url: this.data.href,
            data: {
                format: "json"
            },
            dataType: "json",
            method: "GET"
        });
    },


    open () {
        this._isOpen = true;
        this.element.addClass( "is-active" );
        core.dom.html.addClass( "is-quickview-open" );
    },


    close () {
        this._isOpen = false;
        this.items = [];
        this.navis = [];
        this.blocks = null;
        this.article = null;
        this.currItem = null;
        this.currNavi = null;
        this.current = 0;
        this.length = 0;
        this._isTransition = false;
        this.element.removeClass( "is-active is-loaded" );
        core.dom.html.removeClass( "is-quickview-open" );

        setTimeout(() => {
            this.navi[ 0 ].innerHTML = "";
            this.gallery[ 0 ].innerHTML = "";

        }, 500 );
    },


    isOpen () {
        return this._isOpen;
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default quickview;
