import $ from "properjs-hobo";
import Controller from "properjs-controller";
import PageController from "properjs-pagecontroller";
import paramalama from "paramalama";
import * as gsap from "gsap/all";
import Controllers from "./class/Controllers";
import * as core from "./core";
import header from "./modules/header";



/**
 *
 * @public
 * @namespace router
 * @description Handles async web app routing for nice transitions.
 *
 */
const router = {
    /**
     *
     * @public
     * @method init
     * @memberof router
     * @description Initialize the router module.
     *
     */
    init () {
        this.gsap = gsap;
        this.blit = new Controller();
        this.anim = null;
        this.isDarkTheme = false;
        this.pageClass = "";
        this.animDuration = 400;
        this.controllers = new Controllers({
            el: core.dom.main,
            cb: () => {
                core.emitter.fire( "app--page-teardown" );
            }
        });
        this.bindLinks();
        this.bindEmpty();
        this.initPages();
        this.prepPages();

        core.emitter.on( "app--page-teardown", () => this.topper() );

        core.log( "[Router initialized]", this );
    },


    bindLinks () {
        core.dom.body.on( "click", ".js-links-navi", ( e ) => {
            const target = $( e.target );
            const link = target.is( ".js-links-navi" ) ? target : target.closest( ".js-links-navi" );
            const data = link.data();

            if ( data.darkTheme ) {
                this.isDarkTheme = true;
            }
        });
    },


    /**
     *
     * @public
     * @method bindEmpty
     * @memberof router
     * @description Suppress #hash links.
     *
     */
    bindEmpty () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    prepPages () {
        this.controllers.exec();
    },


    /**
     *
     * @public
     * @method initPages
     * @memberof router
     * @description Create the PageController instance.
     *
     */
    initPages () {
        this.controller = new PageController({
            transitionTime: this.animDuration,
            routerOptions: {
                async: !core.env.isConfig()
            }
        });

        this.controller.setConfig([
            "/",
            ":view",
            ":view/:uid"
        ]);

        // this.controller.setModules( [] );

        this.controller.on( "page-controller-initialized-page", this.initPage.bind( this ) );
        //this.controller.on( "page-controller-router-samepage", () => {} );
        this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
        this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
        this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );

        this.controller.initPage();
    },


    /**
     *
     * @public
     * @method initPage
     * @param {object} data The PageController data object
     * @memberof router
     * @description Cache the initial page load.
     *
     */
    initPage ( data ) {
        this.changeClass( data );
    },


    /**
     *
     * @public
     * @method parseDoc
     * @param {string} html The responseText to parse out
     * @memberof router
     * @description Get the DOM information to cache for a request.
     * @returns {object}
     *
     */
    parseDoc ( html ) {
        let doc = document.createElement( "html" );
        let main = null;

        doc.innerHTML = html;

        doc = $( doc );
        main = doc.find( core.config.mainSelector );

        return {
            doc: doc,
            main: main,
            html: main[ 0 ].innerHTML,
            data: main.data()
        };
    },


    /**
     *
     * @public
     * @method changeClass
     * @param {object} data The PageController data object
     * @memberof router
     * @description Handle document className swapping by page section.
     *
     */
    changeClass ( data ) {
        if ( this.view ) {
            core.dom.html.removeClass( `is-${this.view}-page is-uid-page` );
        }

        if ( this.uid ) {
            core.dom.html.removeClass( "is-uid-page" );
        }

        this.view = (data.request.params.view || core.config.homepage);
        this.uid = (data.request.params.uid || null);

        core.dom.html.addClass( `is-${this.view}-page` );

        if ( this.uid ) {
            core.dom.html.addClass( "is-uid-page" );
        }
    },


    changeTheme ( /*data*/ ) {
        if ( this.isDarkTheme ) {
            this.isDarkTheme = false;
            gsap.TweenLite.to( core.dom.html[ 0 ], (this.animDuration / 1000), {
                css: {
                    color: "#fff",
                    backgroundColor: "#000"
                },
                ease: gsap.Power2.easeInOut,
                onComplete: () => {
                    core.dom.html.addClass( "is-dark-theme" );
                }
            });

        } else {
            gsap.TweenLite.to( core.dom.html[ 0 ], (this.animDuration / 1000), {
                css: {
                    color: "#000",
                    backgroundColor: "#fff"
                },
                ease: gsap.Power2.easeInOut,
                onComplete: () => {
                    core.dom.html.removeClass( "is-dark-theme" );
                }
            });
        }
    },


    animPageOut () {
        this.anim = gsap.TweenLite.to( core.dom.main[ 0 ], (this.animDuration / 1000), {
            css: {
                opacity: 0
            },
            ease: gsap.Power2.easeInOut
        });
    },


    animPageIn () {
        this.blit.go(() => {
            if ( this.anim && !this.anim.isActive() ) {
                this.blit.stop();
                this.anim = gsap.TweenLite.to( core.dom.main[ 0 ], (this.animDuration / 1000), {
                    css: {
                        opacity: 1
                    },
                    ease: gsap.Power2.easeInOut
                });
            }
        });
    },


    /**
     *
     * @public
     * @method changePageOut
     * @param {object} data The PageController data object
     * @memberof router
     * @description Trigger transition-out animation.
     *
     */
    changePageOut ( data ) {
        this.changeClass( data );
        this.changeTheme( data );
        this.controllers.destroy();

        this.animPageOut();
    },


    /**
     *
     * @public
     * @method changeContent
     * @param {object} data The PageController data object
     * @memberof router
     * @description Swap the new content into the DOM.
     *
     */
    changeContent ( data ) {
        const doc = this.parseDoc( data.response );

        this.blit.go(() => {
            if ( this.anim && !this.anim.isActive() ) {
                this.blit.stop();
                this.anim = gsap.TweenLite.to( core.dom.main[ 0 ], (this.animDuration / 1000), {
                    css: {
                        opacity: 1
                    },
                    ease: gsap.Power2.easeInOut
                });
            }
        });

        // Swap out the document HTML
        core.dom.main[ 0 ].innerHTML = doc.html;

        // Ensure topout prior to preload being done...
        this.topper();

        // Execute `pre` controller actions
        this.controllers.exec();

        // Update <header> UI
        header.updateCategory( this.view, paramalama( window.location.search ) );

        // Fire analytics handlers
        core.emitter.fire( "app--analytics-pageview", doc );
    },


    /**
     *
     * @public
     * @method changePageIn
     * @param {object} data The PageController data object
     * @memberof router
     * @description Trigger transition-in animation.
     *
     */
    changePageIn ( /* data */ ) {
        this.execSquarespace();

        this.animPageIn();
    },


    /**
     *
     * @public
     * @method route
     * @param {string} path The uri to route to
     * @memberof router
     * @description Trigger app to route a specific page. [Reference]{@link https://github.com/ProperJS/Router/blob/master/Router.js#L222}
     *
     */
    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    /**
     *
     * @public
     * @method push
     * @param {string} path The uri to route to
     * @param {function} cb Optional callback to fire
     * @memberof router
     * @description Trigger a silent route with a supplied callback.
     *
     */
    push ( path, cb ) {
        this.controller.routeSilently( path, (cb || core.util.noop) );
    },


    /**
     *
     * @public
     * @method topper
     * @memberof router
     * @description Set scroll position and clear scroll classNames.
     *
     */
    topper () {
        window.scrollTo( 0, 0 );
    },


    // Initialize core sqs blocks after ajax routing
    execSquarespace () {
        // setTimeout(() => {
        //     window.Squarespace.initializeVideo( window.Y );
        //     window.Squarespace.initializeCommerce( window.Y );
        //     window.Squarespace.initializeFormBlocks( window.Y, window.Y );
        //     window.Squarespace.initializeLayoutBlocks( window.Y );
        //     window.Squarespace.initializeSummaryV2Block( window.Y );
        //
        // }, 0 );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
