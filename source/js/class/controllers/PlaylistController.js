import $ from "properjs-hobo";
import * as gsap from "gsap/all";
import * as core from "../../core";
import viewTracks from "../../views/tracks";

/**
 *
 * @public
 * @global
 * @class PlaylistController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle loading SoundCloud playlists.
 *
 */
class PlaylistController {
    constructor ( element ) {
        this.element = element;
        this.linkto = this.element.find( ".js-playlist-linkto" );
        this.tracks = this.element.find( ".js-playlist-tracks" );
        this.button = this.element.find( ".js-playlist-more" );
        this.duration = 200;
        this.delay = 20;

        this.load();
        this.bind();
    }


    bind () {
        this.button.on( "click", () => {
            if ( this.button.is( ".is-clicked" ) ) {
                this.tracks.removeClass( "is-clicked" );
                this.button.removeClass( "is-clicked" );
                this.button[ 0 ].innerHTML = "See full tracklist";

                this.remove( 6, this.json.tracks.length );

            } else {
                this.tracks.addClass( "is-clicked" );
                this.button.addClass( "is-clicked" );
                this.button[ 0 ].innerHTML = "Close tracklist";

                this.add( this.remainder, 6 );
            }
        });
    }


    load () {
        $.ajax({
            url: `http://api.soundcloud.com/playlists/${this.linkto[ 0 ].href.split( "/" ).pop()}`,
            dataType: "json",
            method: "GET",
            data: {
                // `throw way` dev app client ID
                // app registration is closed on SoundCloud as of now: 6-20-2018
                client_id: "y8lUxiCGVupU6oO75IXqDeQUpwLBYx6f"
            }

        }).then(( json ) => {
            this.json = json;
            this.initial = this.json.tracks.slice( 0, 6 );
            this.remainder = this.json.tracks.slice( 6, this.json.tracks.length );

            setTimeout(() => {
                this.tracks[ 0 ].innerHTML = "";
                this.add( this.initial, 0 );

            }, 1000 );

        }).catch(( error ) => {
            core.log( error );
        });
    }


    add ( tracks, offset ) {
        const view = viewTracks( this, tracks, offset );
        const elem = $( view.html );
        const anim = new gsap.TimelineLite();

        this.tracks.append( elem );

        anim.staggerTo(
            elem,
            (this.duration / 1000),
            {
                css: {
                    y: 0,
                    opacity: 1
                },
                ease: gsap.Power4.easeInOut,
                onComplete: () => {
                    gsap.TweenLite.to( this.button[ 0 ], (this.duration / 1000), {
                        css: {
                            opacity: 1
                        },
                        ease: gsap.Power4.easeInOut
                    });
                }
            },
            (this.delay / 1000)
        );
    }


    remove ( offset, bounds ) {
        const tracks = $( this.tracks.find( ".js-playlist-track" ).splice( offset, bounds ).reverse() );
        const anim = new gsap.TimelineLite();
        let blit = 0;

        anim.staggerTo(
            tracks,
            (this.duration / 1000),
            {
                css: {
                    y: -tracks[ 0 ].getBoundingClientRect().height,
                    opacity: 0
                },
                ease: gsap.Power4.easeInOut,
                onComplete: () => {
                    tracks.eq( blit ).remove();
                    blit++;
                }
            },
            (this.delay / 1000)
        );

        gsap.TweenLite.to( window, (this.duration / 1000), {
            scrollTo: 0,
            ease: gsap.Power4.easeInOut
        });
    }


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default PlaylistController;
