import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import Video from "../class/components/Video";


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
            this.perma = this.element.find( ".js-quickview-perma" );

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

        this.element.on( "click", () => {
            if ( !this._isOpen ) {
                return;
            }

            this.advance();
            this.transition();
        });

        core.dom.body.on( "click", ".js-quickview-hit", ( e ) => {
            const target = $( e.target );

            this.data = target.data();
            this.prebuild();
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
            this.close();
        }
    },


    transition () {
        if ( !this._isOpen ) {
            return;
        }

        this._isTransition = true;

        const nextItem = this.items.eq( this.current ).addClass( "is-active" );
        const nextNavi = this.navis.eq( this.current ).addClass( "is-active" );
        const nextVideo = nextItem.data().Video;
        const currVideo = this.currItem.data().Video;

        this.currItem.removeClass( "is-active" );
        this.currNavi.removeClass( "is-active" );

        if ( currVideo ) {
            currVideo.pause();
        }

        if ( nextVideo ) {
            nextVideo.play();
        }

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


    prebuild () {
        this.perma[ 0 ].innerHTML = this.data.title;
        this.perma[ 0 ].href = this.data.href;
    },


    build () {
        this.items = [];
        this.navis = [];
        this.blocks.forEach(( el, i ) => {
            const block = this.blocks.eq( i );
            const data = block.data();
            const type = parseInt( data.blockType, 10 );

            // Image // Gallery
            if ( type === 5 || type === 8 ) {
                const images = block.find( core.config.lazyImageSelector ).addClass( "quickview__media__node" );

                images.forEach(( img ) => {
                    this.navis.push( `<div class="quickview__navi__item"></div>` );
                    this.items.push( `<div class="quickview__gallery__item">${img.outerHTML}</div>` );
                });

            // Video
            } else if ( type === 32 ) {
                this.navis.push( `<div class="quickview__navi__item"></div>` );
                this.items.push( `<div class="quickview__gallery__item js-quickview-video">
                    <div class="sqs-block-video" data-block-json='${JSON.stringify( data.blockJson )}'>
                        <div class="sqs-block-content"></div>
                    </div>
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

        this.gallery.find( ".js-quickview-video" ).forEach(( el ) => {
            const jsVideo = $( el );
            const sqsVideo = jsVideo.find( ".sqs-block-video" );

            jsVideo.data( "Video", new Video( sqsVideo ) );
        });

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

        this.gallery.find( ".js-quickview-video" ).forEach(( el ) => {
            const jsVideo = $( el );
            const videoInstance = jsVideo.data().Video;

            if ( videoInstance ) {
                videoInstance.destroy();
            }
        });

        setTimeout(() => {
            this.navi[ 0 ].innerHTML = "";
            this.gallery[ 0 ].innerHTML = "";
            this.perma[ 0 ].innerHTML = "";
            this.perma[ 0 ].href = "";

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
