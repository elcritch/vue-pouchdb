var uuidModule = require( 'uuid' );
var PouchDB = require( 'pouchdb' );

var init = function () {
   var bindings = this.$options.pouchdb
   ensureRef( this )
   for ( var key in bindings ) {
      bind( this, key, bindings[ key ] )
   }
}

function ensureRef( vm ) {
   if ( !vm.$db ) {
      vm.$db = Object.create( null )
   }
}

function defineReactive( vm, key, val ) {
   if ( key in vm ) {
      vm[ key ] = val
   }
   else {
      Vue.util.defineReactive( vm, key, val )
   }
}

function bind( vm, key, source ) {
   var array = []
   defineReactive( vm, key, {} )
   var localDB = new PouchDB( source.localdb );

   // var remoteDB = new PouchDB( source.remoteURL );

   vm.$db[ key ] = localDB

   vm.$db[ key ].put = function ( data, id ) {
      var _id = id || uuidModule.v1();
      data[ '_id' ] = _id

      return new Promise( function ( resolve, reject ) {
         localDB
            .put( data )
            .then( function ( doc ) {
               // data[ '_rev' ] = doc.rev
               // vm[ key ][ uuid ] = doc
               Vue.set( vm[ key ], uuid, doc );
               resolve( data )
            } )
            .catch( function ( err ) {
               data = Object.create( null )
               reject( err )
            } );
      } );
   }

   vm.$db[ key ].update = function ( data ) {
      var uuid = data[ '_id' ]
      return new Promise( function ( resolve, reject ) {
         localDB
            .put( data )
            .then( function ( doc ) {
               // data[ '_rev' ] = doc.rev
               // vm[ key ][ uuid ] = doc
               Vue.set( vm[ key ], uuid, doc );
               resolve( doc )
            } )
            .catch( function ( err ) {
               reject( err )
            } )
      } )
   }

   vm.$db[ key ].delete = function ( data ) {
      var id = data[ '_id' ]
      var rev = data[ '_rev' ]

      return new Promise( function ( resolve, reject ) {
         localDB.remove( id, rev )
            .then( function ( doc ) {
               // check for connection
               Vue.delete( vm[ key ], uuid )
                  // promise accept
               resolve( doc );
            } )
            .catch( function ( err ) {
               reject( err )
            } )
      } )
   }

   // if ( remoteDB.active === true ) {
   localDB.changes( {
         since: 0,
         live: true,
         include_docs: true
      } )
      .on( 'change', function ( change ) {

         var docs = change.changes.docs || [ change.doc ];

         // TODO: Refactor docs check
         // console.log( "SYNC: ", change, docs )

         docs.forEach( function ( doc ) {
            var uuid = doc[ '_id' ]
            if ( doc[ '_deleted' ] ) {
               Vue.delete( vm[ key ], uuid )
            }
            else {
               // console.log( "SYNC: ", doc, vm[ key ][ uuid ] )
               // vm[ key ][ uuid ] = doc
               Vue.set( vm[ key ], uuid, doc );
               // console.log( "SYNC:post: ", vm[ key ][ uuid ] )
               // defineReactive( vm, uuid, doc );
               // var uuid = doc[ '_id' ]
            }
         } )
      } );
   // }

   localDB.allDocs( {
         include_docs: true,
         descending: true
      } )
      .then( function ( doc ) {
         var objs = {}
         doc.rows.forEach( d => {
            objs[ d._id ] = d.doc;
            console.log( "d: ", d );
         } );
         defineReactive( vm, key, objs );
      } )
      .catch( function ( err ) {

      } )
}

var PouchMixin = {
   init: init, // making it usable with vuejs 1.x.x
   beforeCreate: init
}

// auto install
// if ( typeof window !== 'undefined' && window.Vue ) {
//    install( window.Vue )
// }


exports.PouchMixin = PouchMixin
