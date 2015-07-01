import "jquery/dist/jquery";
import "node_modules/hammerjs/hammer";
import { emitter } from "app/util";
import "app/env";
import "app/dom";
import "app/router";
import "app/overlay";
import "app/actions";
import "app/resizes";
import "app/collection";


window.onload = function () {
    // Global router initializer
    router.init();


    // Global overlay initializer
    overlay.init();


    // Global actions initializer
    actions.init();


    // Global resizing initializer
    resizes.init();


    // Global collection initializer
    collection.init();


    // Global event dispatching
    emitter.on( "app--scroll", actions.doScrollerAction );
    emitter.on( "app--resize", actions.doScrollerAction );
    emitter.on( "app--load-audio", actions.doSquarespaceAudioAction );
    emitter.on( "app--load-video", actions.doSquarespaceVideoAction );
};