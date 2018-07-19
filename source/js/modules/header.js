import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import paramalama from "paramalama";
import info from "./info";
import viewCats from "../views/cats";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";
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
            this.resizer = new ResizeController();
            this.controller = new Controller();

            // Mixed properties
            this.data = this.element.data();
            this.defaultCategory = "everything";
            this.tween = null;
            this.mouse = null;
            this.threshold = 100;

            // Interaction flags
            this._isNaviOpen = false;
            this._isNaviHover = false;
            this._isNaviClick = false;
            this._isNaviTween = false;
            this._isNaviHoverIcon = false;
            this._isNaviHoverDisabled = false;

            // Elements
            this.infoTrigger = this.element.find( ".js-navi-info" );
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.navi = this.element.find( ".js-navi" );
            this.returner = this.element.find( ".js-navi-returner" );
            this.returner[ 0 ].href = this.data.root;
            this.mobileCategory = this.element.find( ".js-navi-mobile-category" );
            this.mobileTrigger = this.element.find( ".js-navi-mobile-trigger" );
            this.infoLabels = core.dom.body.find( ".js-header-labels" );
            this.labelInfo = this.infoLabels.find( ".js-label-info" );
            this.labelClose = this.infoLabels.find( ".js-label-close" );

            this.load().then(( json ) => {
                this.json = json;
                this.done();
                this.bindClick();
                this.bindWatch();
                this.resetLabels();

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

        this.categoryMenu[ 0 ].innerHTML = cats.html;
        this.categories = this.element.find( ".js-menu-category" );

        this.mobileCategory[ 0 ].innerHTML = cats.meow;
    },


    bindClick () {
        this.categoryMenu.on( "click", ".js-menu-category", ( e ) => {
            const elem = $( e.target );
            const data = elem.data();

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );

            this.mobileCategory[ 0 ].innerHTML = data.cat;

            if ( this._isNaviOpen ) {
                this.closeNavi();
            }
        });

        this.mobileTrigger.on( "click", () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();

            } else {
                this.openNavi();
            }
        });

        this.categoryMenu.on( "click", () => {
            if ( this._isNaviOpen ) {
                this.closeNavi();
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

            this.resetLabels();
        });

        this.scroller.on( "scrolldown", () => {
            core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
        });

        this.scroller.on( "scrollup", () => {
            core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
        });

        this.resizer.on( "resize", () => {
            this.resetLabels();
        });
    },


    bindMouse () {
        this.infoTrigger.on( "mouseenter", () => {
            if ( !this._isNaviHoverIcon ) {
                const label = info.isOpen() ? this.labelClose : this.labelInfo;
                const labelValues = this.getLabelValues( label );

                this.disableTween();
                this._isNaviHoverIcon = true;

                this.tweenLabel( label[ 0 ], 0.75, {
                    x: labelValues.x,
                    y: labelValues.y,
                    opacity: 1
                });
            }

        }).on( "mouseleave", () => {
            if ( this._isNaviHoverIcon ) {
                this._isNaviHoverIcon = false;
                this.enableTween();
            }

        }).on( "click", () => {
            if ( !this._isNaviClick ) {
                this.resetLabels();
                this._isNaviClick = true;
            }
        });

        core.dom.doc.on( "mousemove", ( e ) => {
            const label = info.isOpen() ? this.labelClose : this.labelInfo;
            const labelValues = this.getLabelValues( label );

            // Store realtime Event
            this.mouse = e;
            this.distance = this.getDistanceBetween(
                labelValues.x,
                this.mouse.clientX,
                labelValues.y,
                this.mouse.clientY
            );

            // Capture click
            if ( this._isNaviClick ) {
                this.resetClick();

            // Suppress interaction for a whole cycle
            } else if ( this.distance < this.threshold && this._isNaviHoverDisabled ) {
                // Silence is golden...

            } else if ( this.distance >= this.threshold && this._isNaviHoverDisabled ) {
                // End the silence!
                this._isNaviHoverDisabled = false;

            // End Interaction
            } else if ( this.distance >= this.threshold ) {
                this.resetLabel();

            // Start Interaction
            } else if ( this.distance < this.threshold && !this._isNaviHover && !this._isNaviHoverIcon ) {
                this.enableLabel();

            // Enter tween cycle
            } else if ( this.distance < this.threshold && this._isNaviHover && !this._isNaviHoverIcon && !this._isNaviTween ) {
                this.enableTween();
            }
        });
    },


    disableTween () {
        this._isNaviTween = false;
        this.controller.stop();
    },


    enableTween () {
        this._isNaviTween = true;

        this.controller.go(throttle(() => {
            if ( this._isNaviTween ) {
                const label = info.isOpen() ? this.labelClose : this.labelInfo;
                const closestPoint = this.getClosestPointToMouse( label );
                const midpoint = this.getMidpointOfLine(
                    this.mouse.clientX,
                    closestPoint.x,
                    this.mouse.clientY,
                    closestPoint.y
                );
                const infoBounds = this.infoTrigger[ 0 ].getBoundingClientRect();

                if ( this.mouse.clientX < (infoBounds.left + (infoBounds.width / 2)) ) {
                    this.tweenLabel( label[ 0 ], 0.75, {
                        x: (midpoint.x - closestPoint.xOff),
                        y: (midpoint.y - closestPoint.yOff),
                        opacity: 1
                    });

                } else {
                    this.tweenLabel( label[ 0 ], 0.75, {
                        opacity: 1
                    });
                }
            }

        }, 50 ));
    },


    enableLabel () {
        const label = info.isOpen() ? this.labelClose : this.labelInfo;

        this._isNaviHover = true;
        label.addClass( "is-hover" );
    },


    resetClick () {
        this.disableTween();
        this._isNaviHoverDisabled = true;
        this._isNaviHover = false;
        this._isNaviClick = false;
        this._isNaviHoverIcon = false;
    },


    resetLabel () {
        const label = info.isOpen() ? this.labelClose : this.labelInfo;
        const labelValues = this.getLabelValues( label );

        this.disableTween();
        this._isNaviHover = false;
        this._isNaviClick = false;
        this._isNaviHoverIcon = false;
        this.labelClose.removeClass( "is-hover" );
        this.labelInfo.removeClass( "is-hover" );

        this.tweenLabel( label[ 0 ], 0.5, {
            x: labelValues.x,
            y: labelValues.y,
            opacity: 0
        });
    },


    resetLabels () {
        this.disableTween();
        this._isNaviHover = false;
        this._isNaviClick = false;
        this._isNaviHoverIcon = false;
        this.labelClose.removeClass( "is-hover" );
        this.labelInfo.removeClass( "is-hover" );

        [this.labelInfo, this.labelClose].forEach(( label ) => {
            const labelValues = this.getLabelValues( label );

            gsap.TweenLite.to( label, 0, {
                css: {
                    x: labelValues.x,
                    y: labelValues.y,
                    opacity: 0
                },
                ease: gsap.Power4.easeOut
            });
        });
    },


    tweenLabel ( label, dur, css ) {
        if ( this.tween ) {
            this.tween.kill();
        }

        return new Promise(( resolve ) => {
            this.tween = gsap.TweenLite.to( label, dur, {
                css,
                ease: gsap.Power4.easeOut,
                onComplete: () => {
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


    getLabelValues ( label ) {
        const infoBounds = this.infoTrigger[ 0 ].getBoundingClientRect();
        const labelBounds = label[ 0 ].getBoundingClientRect();

        return {
            x: (infoBounds.left - (labelBounds.width + 20)),
            y: (infoBounds.top + (infoBounds.height / 2)) - (labelBounds.height / 2)
        };
    },


    getClosestPointToMouse ( label ) {
        const labelBounds = label[ 0 ].getBoundingClientRect();
        const labelPoints = [
            // top left
            { x: labelBounds.x, y: labelBounds.y, xOff: 0, yOff: 0, label: "top left" },
            // top middle
            { x: labelBounds.x + (labelBounds.width / 2), y: labelBounds.y, xOff: labelBounds.width / 2, yOff: 0, label: "top middle" },
            // top right
            { x: labelBounds.x + labelBounds.width, y: labelBounds.y, xOff: labelBounds.width, yOff: 0, label: "top right" },
            // bottom left
            { x: labelBounds.x, y: labelBounds.y + labelBounds.height, xOff: 0, yOff: labelBounds.height, label: "bottom left" },
            // bottom middle
            { x: labelBounds.x + (labelBounds.width / 2), y: labelBounds.y + labelBounds.height, xOff: labelBounds.width / 2, yOff: labelBounds.height, label: "bottom middle" },
            // bottom right
            { x: labelBounds.x + labelBounds.width, y: labelBounds.y + labelBounds.height, xOff: labelBounds.width, yOff: labelBounds.height, label: "bottom right" },
            // middle left
            { x: labelBounds.x, y: labelBounds.y + (labelBounds.height / 2), xOff: 0, yOff: labelBounds.height / 2, label: "middle left" },
            // middle right
            { x: labelBounds.x + labelBounds.width, y: labelBounds.y + (labelBounds.height / 2), xOff: labelBounds.width, yOff: labelBounds.height / 2, label: "middle right" }
        ];

        const updatedPoints = labelPoints.map(( labelPoint ) => {
            labelPoint.distance = this.getDistanceBetween(
                this.mouse.clientX,
                labelPoint.x,
                this.mouse.clientY,
                labelPoint.y
            );

            return labelPoint;

        }).sort(( labelPointA, labelPointB ) => {
            let ret = 0;

            // sort lowest to top always
            if ( labelPointA.distance < labelPointB.distance ) {
                ret = -1;
            }

            if ( labelPointB.distance < labelPointA.distance ) {
                ret = 1;
            }

            return ret;
        });

        return updatedPoints.shift();
    },


    updateCategory ( view, params ) {
        if ( this.element.length ) {
            const elem = params.category ? this.categories.filter( `.js-menu--${params.category.toLowerCase()}` ) : this.categories.filter( ".js-menu--everything" );

            this.categories.removeClass( "is-active" );
            elem.addClass( "is-active" );
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
