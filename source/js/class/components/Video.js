import loadJS from "fg-loadjs";
import paramalama from "paramalama";
import * as core from "../../core";
import videoView from "../../views/video";



/**
 *
 * @public
 * @global
 * @class Video
 * @classdesc Handle video logics.
 *
 */
class Video {
    constructor ( element, quickview ) {
        this.element = element;
        this.content = this.element.find( ".sqs-block-content" );
        this.quickview = quickview;
        this.data = this.element.data();
        this.params = paramalama( this.data.blockJson.url );
        this.id = (this.data.blockJson.resolvedBy === "youtube" && this.params.v) ? this.params.v : this.data.blockJson.url.split( "/" ).pop();
        this.isPlaying = false;

        this.load();
        this.bind();
    }


    load () {
        this.image = this.element.find( "img" );
        this.data.imageJson = this.image.data();
        this.content[ 0 ].innerHTML = videoView( this.data.blockJson, this.data.imageJson, this.data );
        this.iframe = this.element.find( ".js-embed-iframe" );

        if ( this.data.blockJson.resolvedBy === "vimeo" ) {
            this.vimeoLoad();

        } else {
            this.youtubeLoad();
        }

        core.util.loadImages( this.element.find( core.config.lazyImageSelector ), core.util.noop );
    }


    bind () {
        if ( this.data.blockJson.resolvedBy === "vimeo" ) {
            this.vimeoBind();
        }

        this.element.on( "click", ".js-embed-playbtn", () => {
            if ( !this.isPlaying ) {
                this.play();
            }
        });
    }


    play () {
        if ( this.data.blockJson.resolvedBy === "vimeo" ) {
            this.vimeoPostMessage( "play", null );

        } else {
            this.youtubePlayer.playVideo();
        }
    }


    pause () {
        if ( this.data.blockJson.resolvedBy === "vimeo" ) {
            this.vimeoPostMessage( "pause", null );

        } else {
            this.youtubePlayer.pauseVideo();
        }
    }


/******************************************************************************
 * Vimeo handling
*******************************************************************************/
    vimeoBind () {
        this._vimeoOnMessage = this.vimeoOnMessage.bind( this );
        window.addEventListener( "message", this._vimeoOnMessage, false );
    }


    vimeoLoad () {
        this.iframe[ 0 ].src = this.iframe.data().src;
    }


    vimeoPostMessage ( method, value ) {
        const data = { method };

        if ( value ) {
            data.value = value;
        }

        const message = JSON.stringify( data );

        this.iframe[ 0 ].contentWindow.postMessage( message, "*" );
    }


    vimeoOnMessage ( e ) {
        const message = JSON.parse( e.data );
        const isSelf = (message.player_id && message.player_id === this.id);

        if ( message.event === "ready" ) {
            this.vimeoPostMessage( "addEventListener", "play" );
            this.vimeoPostMessage( "addEventListener", "pause" );
            this.vimeoPostMessage( "addEventListener", "finish" );

        } else if ( message.event === "play" && isSelf ) {
            this.isPlaying = true;
            this.element.addClass( "is-embed-playing" );

        } else if ( message.event === "pause" && isSelf ) {
            this.isPlaying = false;

        } else if ( message.event === "finish" && isSelf ) {
            this.isPlaying = false;
            this.element.removeClass( "is-embed-playing" );

            if ( this.quickview ) {
                this.quickview.advance();
                this.quickview.transition();
            }
        }
    }


/******************************************************************************
 * Youtube handling
*******************************************************************************/
    youtubeOnReady () {
        const playerVars = {
            disablekb: 1,
            controls: 1,
            iv_load_policy: 3,
            loop: 0,
            modestbranding: 1,
            playsinline: 0,
            rel: 0,
            showinfo: 0,
            wmode: "opaque",
            autoplay: 0
        };

        if ( this.data.minimal ) {
            playerVars.playsinline = 1;
            playerVars.controls = 0;
        }

        this.youtubePlayer = new window.YT.Player( this.iframe[ 0 ], {
            height: (this.data.blockJson.height || 9),
            width: (this.data.blockJson.width || 16),
            videoId: this.id,
            playerVars,
            events: {
                onReady: ( /*e*/ ) => {},
                onStateChange: ( e ) => {
                    /*
                        BUFFERING:3
                        CUED:5
                        ENDED:0
                        PAUSED:2
                        PLAYING:1
                        UNSTARTED:-1
                    */
                    if ( e.data === window.YT.PlayerState.PLAYING ) {
                        this.isPlaying = true;
                        this.element.addClass( "is-embed-playing" );

                    } else if ( e.data === window.YT.PlayerState.PAUSED ) {
                        this.isPlaying = false;

                    } else if ( e.data === window.YT.PlayerState.ENDED ) {
                        this.isPlaying = false;
                        this.element.removeClass( "is-embed-playing" );

                        if ( this.quickview ) {
                            this.quickview.advance();
                            this.quickview.transition();
                        }
                    }
                }
            }
        });
    }


    youtubeLoad () {
        if ( !window.YT ) {
            window.onYouTubeIframeAPIReady = () => {
                delete window.onYouTubeIframeAPIReady;

                this.youtubeOnReady();
            };

            loadJS( "https://www.youtube.com/iframe_api" );

        } else {
            this.youtubeOnReady();
        }
    }


    destroy () {
        if ( this._vimeoOnMessage ) {
            window.removeEventListener( "message", this._vimeoOnMessage, false );
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Video;
