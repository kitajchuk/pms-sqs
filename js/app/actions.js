/*!
 *
 * App Module: /actions
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/dom";
import { duration2, duration3 } from "app/config";
import { toggleMouseWheel, toggleTouchMove, isImageLoadable, loadImages, scroller } from "app/util";


var $_jsLoadin = $( ".js-loadin" ),
    $_jsLoadinLogo = $( ".js-loadin-logo" ),
    $_jsScroll = dom.body.add( dom.html ),


actions = {
    init: function () {
        toggleMouseWheel( false );
        toggleTouchMove( false );

        // Force experience to start at top of page
        $_jsScroll.animate( {scrollTop: 0}, "fast" );

        this.doScrollerAction( 0 );
        this.doImageLoadAction(function () {
            actions.doSquarespaceVideoHack();

            $_jsLoadinLogo.addClass( "is-active" );

            setTimeout(function () {
                $_jsLoadinLogo.removeClass( "is-active" );

                setTimeout( actions.doLoadinAction, duration2 );

            }, 1500 );
        });

        console.log( "actions initialized" );
    },


    doPageviewAction: function ( id ) {
        var fullUrl = window.location.pathname,
            title = document.title.split( "—" )[ 0 ].replace( /^\s+|\s+$/g, "" ),
            datas = id.split( "-" ),
            track = {
                fullUrl: fullUrl,
                title: title,
                id: datas[ 1 ]
            };

        // Track an item
        if ( window.location.pathname.replace( /^\/|\/$/, "" ).split( "/" ).length > 1 ) {
            track.commentState = 2;
            track.publicCommentCount = 0;
            track.recordType = 1;
        }

        Y.Squarespace.Analytics.view( datas[ 0 ], track );

        console.log( "Squarespace analytics tracker : pageview", datas[ 0 ], track );
    },


    doImageLoadAction: function ( callback ) {
        var selector = ".js-lazy-image",
            $images = $( selector ),
            $visible = $( [] ),
            delayedLoad = function () {
                setTimeout( callback, duration3 );

                if ( $images.length !== $visible.length ) {
                    loadImages( $images.not( $visible ), isImageLoadable ).on( "done", function () {
                        console.log( "all page images loaded" );
                    });

                } else {
                    console.log( "all page images loaded" );
                }
            };

        $images.each(function () {
            if ( isImageLoadable( this ) ) {
                $visible.push( this );
            }
        });

        if ( !$visible.length ) {
            delayedLoad();

        } else {
            loadImages( $visible ).on( "done", function () {
                delayedLoad();
            });
        }
    },


    doSquarespaceVideoAction: function () {
        Y.all( ".sqs-block.video-block .sqs-block-content, .sqs-block.embed-block .sqs-block-content" ).each(function ( b ) {
            Y.Squarespace.UrlUtils.securifyBlockEmbed( b );
            if ( b.test( ".sqs-block.video-block .sqs-block-content" ) ) {
                b = b.one( ".sqs-video-wrapper" );
                Squarespace.initializeVideoBlock( b );
            }
        });

        actions.doSquarespaceVideoHack();
    },


    doSquarespaceAudioAction: function () {
        if ( !Y.Squarespace.Widgets.AudioPlayer ) {
            Squarespace.addLoadTrigger( ".sqs-audio-embed", ["squarespace-audio-player"] );

        } else {
            Y.all( ".sqs-audio-embed" ).each(function ( node ) {
                if ( !node.all( ".sqs-widget" ).size() ) {
                    var widget = new Y.Squarespace.Widgets.AudioPlayerMinimal( { render: node } );

                    widget.render();
                }
            });
        }
    },


    doSquarespaceVideoHack: function () {
        var $videos = $( ".sqs-block-video" );

        $videos.each(function () {
            var $this = $( this );

            if ( $this.find( ".video-caption-wrapper" ).length ) {
                $this.addClass( "is-caption" );
            }
        });
    },


    doScrollerAction: function ( scrollPos ) {
        var offsetTop,
            offsetBot,
            $this;

        scrollPos = (scrollPos || scroller.getScrollY());

        $( ".js-article, .js-activate" ).each(function () {
            $this = $( this );
            offsetTop = $this.offset().top;
            offsetBot = (offsetTop + $this.outerHeight());

            // Post is within the viewport
            if ( (scrollPos + window.innerHeight) > offsetTop && scrollPos < offsetBot ) {
                $this.addClass( "is-visible is-active" );

            } else {
                $this.removeClass( "is-visible is-active" );
            }
        });
    },


    doLoadinAction: function () {
        $_jsLoadin.addClass( "is-leaving" );
        dom.page.removeClass( "is-overlain" );

        toggleMouseWheel( true );
        toggleTouchMove( true );

        setTimeout(function () {
            $_jsLoadin.removeClass( "is-active is-leaving" );

        }, duration3 );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default actions;