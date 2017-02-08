var PouchDB = require( 'pouchdb' );
PouchDB.plugin( require( 'pouchdb-authentication' ) );

import Main from "./Main"

// auto install in dist mode
if ( typeof window !== 'undefined' && window.Vue ) {
   install( window.Vue )
}


/**
 * Create a single PouchDB instance on all Vue VM's that have this plugin
 **/

function install( Vue ) {
   Vue.mixin( Main.PouchMixin )
}


exports.install = install;

// exports.install = function ( Vue, options ) {
//    Vue.prototype.$db = new PouchDB( options );
// };
