import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import paramalama from "paramalama";
import info from "./info";
import viewCats from "../views/cats";
import ScrollController from "properjs-scrollcontroller";
import Controller from "properjs-controller";
import throttle from "properjs-throttle";


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
            // Event controllers
            this.scroller = new ScrollController();
            this.controller = new Controller();

            // Mixed properties
            this.data = this.element.data();
            this.defaultCategory = "everything";

            // Elements
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.returner = this.element.find( ".js-navi-returner" );
            this.returner[ 0 ].href = this.data.root;
            this.mobileCategory = this.element.find( ".js-navi-mobile-category" );
            this.mobileTrigger = this.element.find( ".js-navi-mobile-trigger" );

            // Mousemove elements
            this.infoTrigger = this.element.find( ".js-navi-info" );
            this.dotinfo = core.dom.body.find( ".js-dotinfo" );
            this.labelInfo = this.element.find( ".js-label-info" );
            this.labelClose = this.element.find( ".js-label-close" );
            this.tween = null;
            this.mouse = null;
            this.threshold = 64;
            this.thresholdBreak = 24;
            this._isNaviOpen = false;
            this._isNaviHover = false;
            this._isNaviClick = false;
            this._isNaviTween = false;
            this._isNaviHoverIcon = false;

            this.load().then(( json ) => {
                this.json = json;
                this.done();
                this.bindClick();
                this.bindWatch();

                if ( !core.detect.isDevice() ) {
                    this.bindMouse();
                }
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

        this.mobileCategory[ 0 ].innerHTML = cats.meow;
        this.categoryMenu[ 0 ].innerHTML = cats.html;
        this.categoryMenuMobile = $( this.categoryMenu[ 0 ].cloneNode( true ) );
        this.categoryMenuMobile.removeClass( "menu--categories" ).addClass( "menu--mobile" );

        // Append mobile menu then query ALL category elements
        core.dom.body.append( this.categoryMenuMobile );
        this.categories = core.dom.body.find( ".js-menu-category" );
    },


    bindClick () {
        const onClickMenu = () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();
            }
        };
        const onClickCategory = ( e ) => {
            const elem = $( e.target );
            const data = elem.data();

            this.categories.removeClass( "is-active" );
            this.categories.filter( `.js-menu--${data.cat}` ).addClass( "is-active" );

            this.mobileCategory[ 0 ].innerHTML = data.cat;

            if ( this._isNaviOpen ) {
                this.closeNavi();
            }
        };

        this.categoryMenu.on( "click", onClickMenu );
        this.categoryMenu.on( "click", ".js-menu-category", onClickCategory );
        this.categoryMenuMobile.on( "click", onClickMenu );
        this.categoryMenuMobile.on( "click", ".js-menu-category", onClickCategory );

        this.mobileTrigger.on( "click", () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();

            } else {
                this.openNavi();
            }
        });

        this.infoTrigger.on( "click", () => {
            if ( !info.isOpen() ) {
                info.open();

            } else {
                info.close();
            }
        });
    },


    bindWatch () {
        this.scroller.on( "scroll", () => {
            const scroll = this.scroller.getScrollY();
            const bounds = this.element[ 0 ].getBoundingClientRect();

            if ( scroll >= bounds.height ) {
                core.dom.html.addClass( "is-header-small" );

            } else if ( scroll <= 0 ) {
                core.dom.html.removeClass( "is-header-small" );
            }

            // Scrolling at all kills whole interaction
            this.resetHover();
        });

        this.scroller.on( "scrolldown", () => {
            core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
        });

        this.scroller.on( "scrollup", () => {
            core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
        });
    },


    bindMouse () {
        const mouseController = new Controller();

        mouseController.go(() => {
            if ( !this._isNaviHover && !this.tween ) {
                this.moveDot();
            }

            if ( window.innerWidth >= core.config.mobileMediaHack ) {
                this.closeNavi();
            }
        });

        this.infoTrigger.on( "mouseenter", () => {
            if ( !this._isNaviHoverIcon ) {
                this._isNaviHoverIcon = true;

                if ( info.isOpen() ) {
                    this.labelInfo.removeClass( "is-hover" );
                    this.labelClose.addClass( "is-hover" );

                } else {
                    this.labelInfo.addClass( "is-hover" );
                    this.labelClose.removeClass( "is-hover" );
                }
            }

        }).on( "mouseleave", () => {
            if ( this._isNaviHoverIcon ) {
                this._isNaviHoverIcon = false;
                this.labelInfo.removeClass( "is-hover" );
                this.labelClose.removeClass( "is-hover" );
            }

        }).on( "click", () => {
            if ( !this._isNaviClick ) {
                this._isNaviClick = true;
                this.labelClose.removeClass( "is-hover" );
                this.labelInfo.removeClass( "is-hover" );
            }
        });

        core.dom.doc.on( "mousemove", ( e ) => {
            const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();
            const dotCenter = {
                x: dotBounds.left + (dotBounds.width / 2),
                y: dotBounds.top + (dotBounds.height / 2)
            };

            // Store realtime Event
            this.mouse = e;
            this.distance = this.getDistanceBetween(
                dotCenter.x,
                this.mouse.clientX,
                dotCenter.y,
                this.mouse.clientY
            );

            // Capture click
            if ( this._isNaviClick ) {
                this.resetClick();

            } else if ( this.distance <= this.thresholdBreak ) {
                this.resetDot();

            // End Interaction
            } else if ( this.distance >= this.threshold ) {
                this.resetDot();

            // Start Interaction
            } else if ( this.distance < this.threshold && !this._isNaviHover && !this._isNaviHoverIcon ) {
                this.enableDot();

            // Enter tween cycle
            } else if ( this.distance < this.threshold && this._isNaviHover && !this._isNaviHoverIcon && !this._isNaviTween ) {
                this.enableTween();
            }
        });
    },


    disableTween () {
        if ( this.tween ) {
            this.tween.kill();
            this.tween = null;
        }

        this.controller.stop();
        this._isNaviTween = false;
    },


    enableTween () {
        this._isNaviTween = true;

        this.controller.go(throttle(() => {
            if ( this._isNaviTween ) {
                const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();
                const dotCenter = {
                    x: dotBounds.left + (dotBounds.width / 2),
                    y: dotBounds.top + (dotBounds.height / 2)
                };
                const midpoint = this.getMidpointOfLine(
                    this.mouse.clientX,
                    dotCenter.x,
                    this.mouse.clientY,
                    dotCenter.y
                );

                this.tweenDot( 0.75, {
                    x: midpoint.x - (dotBounds.width / 2),
                    y: midpoint.y - (dotBounds.height / 2)
                });
            }

        }, 50 ));
    },


    enableDot () {
        this._isNaviHover = true;
    },


    resetClick () {
        this.disableTween();
        this._isNaviHover = false;
        this._isNaviClick = false;
        this._isNaviHoverIcon = false;
    },


    resetDot () {
        const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();

        this.disableTween();
        this._isNaviHover = false;
        this._isNaviClick = false;

        this.tweenDot( 0.5, {
            x: dotBounds.left,
            y: dotBounds.top
        });
    },


    resetHover () {
        this.disableTween();
        this._isNaviHover = false;
        this._isNaviClick = false;
        this._isNaviTween = false;
        this._isNaviHoverIcon = false;
    },


    moveDot () {
        const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();

        gsap.TweenLite.set( this.dotinfo[ 0 ], {
            css: {
                x: dotBounds.left,
                y: dotBounds.top
            }
        });
    },


    tweenDot ( dur, css ) {
        if ( this.tween ) {
            this.tween.kill();
        }

        return new Promise(( resolve ) => {
            this.tween = gsap.TweenLite.to( this.dotinfo[ 0 ], dur, {
                css,
                ease: gsap.Power4.easeOut,
                onComplete: () => {
                    this.tween = null;
                    resolve();
                }
            });
        });
    },


    getMidpointOfLine ( x1, x2, y1, y2 ) {
        const x3 = (x1 + x2) / 2;
        const y3 = (y1 + y2) / 2;

        return {
            x: x3,
            y: y3
        };
    },


    getDistanceBetween ( x1, x2, y1, y2 ) {
        const x3 = x1 - x2;
        const y3 = y1 - y2;

        return Math.sqrt( Math.pow( x3, 2 ) + Math.pow( y3, 2 ) );
    },


    updateCategory ( view, params ) {
        if ( this.element.length ) {
            const cats = params.category ? this.categories.filter( `.js-menu--${params.category.toLowerCase()}` ) : this.categories.filter( ".js-menu--everything" );

            this.categories.removeClass( "is-active" );
            cats.addClass( "is-active" );
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
