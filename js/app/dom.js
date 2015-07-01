/*!
 *
 * App Module: /dom
 *
 * @namespace dom
 * @memberof app
 *
 *
 */
var dom = {
    win: $( window ),
    doc: $( document ),
    html: $( document.documentElement ),
    body: $( document.body ),
    page: $( ".js-page" ),
    module: $( ".js-module" ),
    tags: $( ".js-tag" )
};


/******************************************************************************
 * Export
*******************************************************************************/
export default dom;