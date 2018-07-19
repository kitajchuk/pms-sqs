import * as core from "../core";
import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import paramalama from "paramalama";
import info from "./info";
import viewCats from "../views/cats";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";
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
        this.bounds = this.element[ 0 ].getBoundingClientRect();

        if ( this.element.length ) {
            this.infoTrigger = this.element.find( ".js-navi-info" );
            this.data = this.element.data();
            this.categoryMenu = this.element.find( ".js-menu-categories" );
            this.titleMenu = this.element.find( ".js-menu-title" );
            this.navi = this.element.find( ".js-navi" );
            this.returner = this.element.find( ".js-navi-returner" );
            this.returner[ 0 ].href = this.data.root;
            this.mobileCategory = this.element.find( ".js-navi-mobile-category" );
            this.mobileTrigger = this.element.find( ".js-navi-mobile-trigger" );
            this.defaultCategory = "everything";
            this.scroller = new ScrollController();
            this.resizer = new ResizeController();
            this.infoLabels = core.dom.body.find( ".js-header-labels" );
            this.labelInfo = this.infoLabels.find( ".js-label-info" );
            this.labelClose = this.infoLabels.find( ".js-label-close" );
            this._isNaviOpen = false;
            this._isNaviHover = false;
            this._isNaviClick = false;
            this._isNaviTween = false;
            this._isNaviHoverIcon = false;

            this.load().then(( json ) => {
                this.json = json;
                this.done();
                this.bind();
                this.watch();

                if ( !core.detect.isDevice() ) {
                    this.mouse();
                    this.updateLabels();
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


    bind () {
        this.element.on( "click", ".js-menu-category", ( e ) => {
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


    watch () {
        this.scroller.on( "scroll", () => {
            const scrollPos = this.scroller.getScrollY();

            if ( scrollPos >= this.bounds.height ) {
                core.dom.html.addClass( "is-header-small" );

            } else if ( scrollPos <= 0 ) {
                core.dom.html.removeClass( "is-header-small" );
            }
        });

        this.scroller.on( "scrolldown", () => {
            core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
        });

        this.scroller.on( "scrollup", () => {
            core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
        });

        this.resizer.on( "resize", () => {
            this.bounds = this.element[ 0 ].getBoundingClientRect();
            this.updateLabels();
        });
    },


    mouse () {
        const threshold = 100;
        let midpoint = null;
        let tween = null;
        let mouse = null;
        let mouseDistance = null;
        let label = null;
        let labelValues = null;
        let closestPoint = null;
        let labelBounds = null;

        this.infoTrigger.on( "mouseenter", () => {
            this._isNaviTween = false;
            this._isNaviHoverIcon = true;

            tween = gsap.TweenLite.to( label[ 0 ], 0.75, {
                css: {
                    x: labelValues.x,
                    y: labelValues.y,
                    opacity: 1
                },
                ease: gsap.Power4.easeOut
            });
        });

        this.infoTrigger.on( "mouseleave", () => {
            this._isNaviHoverIcon = false;
            this._isNaviTween = true;
        });

        this.infoTrigger.on( "click", () => {
            this._isNaviClick = true;

            this.labelClose.removeClass( "is-hover" );
            this.labelInfo.removeClass( "is-hover" );

            gsap.TweenLite.to( [this.labelInfo[ 0 ], this.labelClose[ 0 ]], 0, {
                css: {
                    opacity: 0
                },
                ease: gsap.Power4.easeOut
            });
        });

        core.dom.doc.on( "mousemove", throttle(() => {
            if ( this._isNaviTween ) {
                if ( tween ) {
                    tween.kill();
                }

                midpoint = this.getMidpointOfLine(
                    mouse.clientX,
                    closestPoint.x,
                    mouse.clientY,
                    closestPoint.y
                );

                tween = gsap.TweenLite.to( label[ 0 ], 0.75, {
                    css: {
                        x: (midpoint.x - closestPoint.xOff),
                        y: (midpoint.y - closestPoint.yOff),
                        opacity: 1
                    },
                    ease: gsap.Power4.easeOut
                });
            }

        }, 50 ));

        core.dom.doc.on( "mousemove", ( e ) => {
            // Store realtime Event
            mouse = e;

            // Store interaction Label
            label = info.isOpen() ? this.labelClose : this.labelInfo;
            labelValues = this.getLabelValues( label );
            labelBounds = label[ 0 ].getBoundingClientRect();
            mouseDistance = this.getDistanceBetween(
                labelValues.x,
                mouse.clientX,
                labelValues.y,
                mouse.clientY
            );

            // Start Interaction
            if ( mouseDistance < threshold && !this._isNaviHover && !this._isNaviClick && !this._isNaviHoverIcon ) {
                this._isNaviHover = true;
                label.addClass( "is-hover" );

            // End Interaction
            } else if ( mouseDistance >= threshold && this._isNaviHover && !this._isNaviHoverIcon ) {
                this._isNaviClick = false;
                this._isNaviHover = false;
                label.removeClass( "is-hover" );

                // Exit tween cycle
                if ( this._isNaviTween ) {
                    this._isNaviTween = false;

                    if ( tween ) {
                        tween.kill();
                    }

                    tween = gsap.TweenLite.to( label[ 0 ], 0.5, {
                        css: {
                            x: labelValues.x,
                            y: labelValues.y,
                            opacity: 0
                        },
                        ease: gsap.Power4.easeOut
                    });
                }

            // Enter tween cycle
            } else if ( mouseDistance < threshold && this._isNaviHover && !this._isNaviClick && !this._isNaviTween && !this._isNaviHoverIcon ) {
                closestPoint = this.getClosestPointToMouse( label, mouse );
                this._isNaviTween = true;
                // Set a flag for our throttled mousemove handler
            }
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


    getClosestPointToMouse ( label, mouse ) {
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
                mouse.clientX,
                labelPoint.x,
                mouse.clientY,
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


    updateLabels () {
        const labelInfoValues = this.getLabelValues( this.labelInfo );
        const labelCloseBounds = this.getLabelValues( this.labelClose );

        core.util.translate3d(
            this.labelInfo[ 0 ],
            `${labelInfoValues.x}px`,
            `${labelInfoValues.y}px`,
            0
        );

        core.util.translate3d(
            this.labelClose[ 0 ],
            `${labelCloseBounds.x}px`,
            `${labelCloseBounds.y}px`,
            0
        );
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
