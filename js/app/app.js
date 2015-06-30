import "jquery/dist/jquery";
import "node_modules/hammerjs/hammer";
import { emitter, hammered } from "app/util";
import "app/env";
import "app/dom";
import "app/router";
import "app/overlay";
import "app/actions";
import "app/resizes";
import "app/collection";


window.onload = function () {
    router.init();
    overlay.init();
    actions.init();
    resizes.init();
    collection.init();

    hammered.on( "tap", ".js-colophon-icon", function () {
        overlay.open();
    });

    hammered.on( "tap", ".js-logo", function () {
        $( ".js-tag" ).removeClass( "is-active" );
    });

    emitter.on( "app--scroll", actions.doScrollerAction );
    emitter.on( "app--resize", actions.doScrollerAction );
    emitter.on( "app--load-audio", actions.doSquarespaceAudioAction );
    emitter.on( "app--load-video", actions.doSquarespaceVideoAction );
};