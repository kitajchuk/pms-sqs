import Overlap from "../components/Overlap";



/**
 *
 * @public
 * @class OverlapController
 * @param {Hobo} elements The overlap modules
 * @classdesc Handles overlap hover
 *
 */
class OverlapController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.init();
    }


    init () {
        this.elements.forEach(( element, i ) => {
            this.instances.push( new Overlap( this.elements.eq( i ) ) );
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
export default OverlapController;
