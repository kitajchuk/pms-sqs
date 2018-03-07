// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
import router from "./router";
import * as core from "./core";
import Analytics from "./class/Analytics";
import header from "./header";
import intro from "./intro";
import splash from "./splash";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.core = core;
        this.header = header;
        this.intro = intro;
        this.router = router;
        this.splash = splash;

        this.bind();
        this.init();
    }


    bind () {
        this.core.emitter.on( "app--intro-teardown", () => {
            this.core.log( "App Intro Teardown" );
        });

        this.core.emitter.on( "app--page-teardown", () => {
            this.core.log( "App Page Teardown" );
        });
    }


    /**
     *
     * @public
     * @instance
     * @method init
     * @memberof App
     * @description Initialize application modules.
     *
     */
    init () {
        // Core
        this.core.detect.init();

        // Utility ?

        // Views
        this.header.init();
        this.splash.init();
        this.intro.exec().then(() => {
            // Controller
            this.router.init();
        });

        // Analytics
        this.analytics = new Analytics();
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
