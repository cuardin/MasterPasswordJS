//Define the base URL when we are in a separate file.
var base_url = "";

//
importScripts(base_url + '../js/core/encoding-indexes.js' );
importScripts(base_url + '../js/core/encoding.js' );

//This is the compiles non-auditable version.
//importScripts('core/scrypt-asm.js' );
//importScripts('core/scrypt-wrapper.js' );    

//Use the auditable scrypt version.
importScripts(base_url + '../js/core/scrypt.js' );

importScripts(base_url + '../js/core/util.js' );
importScripts(base_url + '../js/core/mpw.js' );
importScripts(base_url + '../js/database.js' );            
importScripts(base_url + '../js/mpw_worker.js' );    
importScripts(base_url + '../database/core/utilitiesCore.php?javascript=true' );    

self.addEventListener('message', handleMessage);

var worker = new MPWWorker();

function handleMessage( event ) 
{            
    worker.handleMessage(event, function (rValue) {
        postMessage( JSON.stringify(rValue));    
    });
}