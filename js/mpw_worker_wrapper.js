//Define the base URL when we are in a separate file.
var base_url = "";

//Need this to covnert UTF characters.
importScripts(base_url + '../js/core/encoding-indexes.js' );
importScripts(base_url + '../js/core/encoding.js' );

//Use the auditable scrypt version.
importScripts(base_url + '../js/core/scrypt.js' );

importScripts(base_url + '../js/core/util.js' );
importScripts(base_url + '../js/core/mpw.js' );
importScripts(base_url + '../js/database.js' );            
importScripts(base_url + '../js/mpw_worker.js' );    

self.addEventListener('message', handleMessage);

var worker = new MPWWorker();

function handleMessage( event ) 
{            
    worker.handleMessage(event, function (rValue) {
        postMessage( JSON.stringify(rValue));    
    });
}