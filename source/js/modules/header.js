import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import paramalama from "paramalama";
import info from "./info";
import quickview from "./quickview";
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
            this.tween = null;
            this.mouse = null;
            this.threshold = 200;
            this.thresholdBreak = 25;
            this._isDotCancel = false;
            this._isNaviOpen = false;
            this._isNaviHover = false;
            this._isNaviTween = false;
            this._isNaviReset = false;
        }
    },


    load () {
        return new Promise(( resolve, reject ) => {
            if ( !this.element.length ) {
                reject();

            } else {
                const query = paramalama( window.location.search );

                query.format = "json";

                $.ajax({
                    url: this.data.root,
                    data: query,
                    dataType: "json",
                    method: "GET"

                }).then(( json ) => {
                    resolve();
                    this.json = json;
                    this.done();
                    this.bindClick();
                    this.bindWatch();

                    if ( !core.detect.isDevice() ) {
                        this.bindMouse();
                    }
                });
            }
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
            this.returner[ 0 ].href = elem[ 0 ].href;

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

        core.dom.doc.on( "click", () => {
            if ( !this._isNaviHover || quickview.isOpen() ) {
                return false;
            }

            if ( !info.isOpen() ) {
                info.open();

            } else {
                info.close();
            }

        }).on( "click", ".js-dotinfo-cancel", () => {
            this._isDotCancel = false;
        });
    },


    bindWatch () {
        this.scroller.on( "scroll", () => {
            if ( !this._isNaviReset ) {
                const scroll = this.scroller.getScrollY();
                const bounds = this.element[ 0 ].getBoundingClientRect();

                if ( scroll >= bounds.height ) {
                    core.dom.html.addClass( "is-header-small" );

                } else if ( scroll <= 0 ) {
                    core.dom.html.removeClass( "is-header-small" );
                }

                // Scrolling at all kills whole interaction
                this.resetHover();
                // this.resetDot();
            }
        });

        this.scroller.on( "scrolldown", () => {
            if ( !this._isNaviReset ) {
                core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
            }
        });

        this.scroller.on( "scrollup", () => {
            if ( !this._isNaviReset ) {
                core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
            }
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

        // Leave the Window entirely
        core.dom.doc.on( "mouseleave", () => {
            this.resetDot();

        // Enter a cancel element
        }).on( "mouseenter", ".js-dotinfo-cancel", () => {
            this._isDotCancel = true;

        // Exit a cancel element
        }).on( "mouseleave", ".js-dotinfo-cancel", () => {
            this._isDotCancel = false;

        // Handle mousemove with flags
        }).on( "mousemove", ( e ) => {
            const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();
            const dotCenter = {
                x: dotBounds.left + (dotBounds.width / 2),
                y: dotBounds.top + (dotBounds.height / 2)
            };

            if ( quickview.isOpen() ) {
                return false;
            }

            // Store realtime Event
            this.mouse = e;
            this.distance = this.getDistanceBetween(
                dotCenter.x,
                this.mouse.clientX,
                dotCenter.y,
                this.mouse.clientY
            );

            // Capture click
            if ( this._isDotCancel ) {
                this.resetDot();

            // End Interaction
            } else if ( this.distance >= this.threshold ) {
                this.resetDot();

            // Start Interaction
            } else if ( this.distance < this.threshold && !this._isNaviHover ) {
                this.enableDot();

            // Enter tween cycle
            } else if ( this.distance < this.threshold && this._isNaviHover && !this._isNaviTween ) {
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
        if ( !quickview.isOpen() ) {
            this._isNaviHover = true;
            core.dom.html.addClass( "is-dotinfo-cursor" );
        }
    },


    resetDot () {
        const dotBounds = this.infoTrigger[ 0 ].getBoundingClientRect();

        core.dom.html.removeClass( "is-dotinfo-cursor" );

        this.disableTween();
        this._isNaviHover = false;

        this.tweenDot( 0.5, {
            x: dotBounds.left,
            y: dotBounds.top
        });
    },


    resetHover () {
        this.disableTween();
        this._isNaviHover = false;
        this._isNaviTween = false;
    },


    resetNavi () {
        this._isNaviReset = true;
        this.resetHover();
        gsap.TweenLite.to( this.element[ 0 ], 0.5, {
            css: {
                opacity: 0
            },
            ease: gsap.Power4.easeOut
        });
    },


    resetScroll () {
        core.dom.html.removeClass( "is-header-small is-scroll-up is-scroll-down" );
    },


    presentNavi () {
        this._isNaviReset = false;
        gsap.TweenLite.to( this.element[ 0 ], 0.5, {
            css: {
                opacity: 1
            },
            ease: gsap.Power4.easeOut
        });
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


    updateCategory ( view, category ) {
        if ( this.element.length ) {
            const cats = category ? this.categories.filter( `.js-menu--${category.toLowerCase()}` ) : this.categories.filter( ".js-menu--everything" );

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
