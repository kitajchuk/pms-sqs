import Loadmore from "../components/Loadmore";



/**
 *
 * @public
 * @class LoadmoreController
 * @param {Hobo} elements The DOM elements
 * @classdesc Handles feed loading AJAX
 *
 */
class LoadmoreController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.init();
    }


    init () {
        this.elements.forEach(( element, i ) => {
            this.instances.push( new Loadmore( this.elements.eq( i ) ) );
        });
    }


    destroy () {
        this.instances.forEach(( instance ) => {
            instance.destroy();
        });
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default LoadmoreController;
