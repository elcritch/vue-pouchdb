var PouchDB = require( 'pouchdb' );
// PouchDB.plugin( require( 'pouchdb-authentication' ) );

var main = require( "./main" );

// auto install in dist mode
// if ( typeof window !== 'undefined' && window.Vue ) {
//    install( window.Vue )
// }


/**
 * Create a single PouchDB instance on all Vue VM's that have this plugin
 **/

function install( Vue ) {
   console.log( "Vue PouchDB install", main )
   Vue.mixin( main.PouchMixin )
}

var PouchMixin = main.PouchMixin

exports.install = install;

// exports.install = function ( Vue, options ) {
//    Vue.prototype.$db = new PouchDB( options );
// };
