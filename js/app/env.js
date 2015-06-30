/*!
 *
 * App Module: /env
 *
 * @namespace env
 * @memberof app
 *
 *
 */
var env = (/squarespace|localhost/.test( document.domain ) ? "development" : "production");


/******************************************************************************
 * Export
*******************************************************************************/
export default env;