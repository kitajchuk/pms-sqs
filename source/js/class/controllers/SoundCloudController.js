import * as core from "../../core";
import $ from "properjs-hobo";
import viewTracks from "../../views/tracks";

/**
 *
 * @public
 * @global
 * @class SoundCloudController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle loading SoundCloud playlists.
 *
 */
class SoundCloudController {
    constructor ( element ) {
        this.element = element;
        this.data = this.element.data();
        this.tracks = this.element.find( ".js-soundcloud-tracks" );

        this.load();
    }


    load () {
        $.ajax({
            url: `http://api.soundcloud.com/playlists/${this.data.url.split( "/" ).pop()}`,
            dataType: "json",
            method: "GET",
            data: {
                // `throw way` dev app client ID
                // app registration is closed on SoundCloud as of now: 6-20-2018
                client_id: "y8lUxiCGVupU6oO75IXqDeQUpwLBYx6f"
            }

        }).then(( json ) => {
            this.json = json;
            this.tracks[ 0 ].innerHTML = viewTracks( this ).html;

        }).catch(( error ) => {
            core.log( error );
        });
    }


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default SoundCloudController;
