// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
// import $ from "properjs-hobo";
import router from "./router";
import * as core from "./core";
import Analytics from "./class/services/Analytics";
import header from "./modules/header";
import intro from "./modules/intro";
import info from "./modules/info";
import splash from "./modules/splash";
import quickview from "./modules/quickview";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.analytics = new Analytics();
        this.core = core;
        this.header = header;
        this.intro = intro;
        this.info = info;
        this.router = router;
        this.quickview = quickview;
        this.splash = splash;

        this.init();
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
        this.core.detect.init();
        this.intro.init();
        this.splash.init();
        this.header.init();
        this.header.load().then(() => {
            this.router.init();
            this.info.init();
            this.quickview.init();
            // this.intro.teardown();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
