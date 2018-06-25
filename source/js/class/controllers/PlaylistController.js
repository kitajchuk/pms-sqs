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

        this.load();
        this.bind();
    }


    bind () {
        this.button.on( "click", () => {
            this.button.remove();

            this.add( this.remainder, 6 );
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

            this.add( this.initial, 0 );

            console.log( this );

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
            (200 / 1000),
            {
                css: {
                    opacity: 1
                },
                ease: gsap.Power2.easeInOut,
                onComplete: () => {
                    gsap.TweenLite.to( this.button[ 0 ], (200 / 1000), {
                        css: {
                            opacity: 1
                        },
                        ease: gsap.Power2.easeOut
                    });
                }
            },
            (50 / 1000)
        );
    }


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default PlaylistController;
