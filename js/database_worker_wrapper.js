//Define the base URL when we are in a separate file.
var base_url = "";

//
importScripts(base_url + '../js/core/util.js' );
importScripts(base_url + '../js/database.js' );            
importScripts(base_url + '../js/database_worker.js' );    
importScripts(base_url + '../js/utilitiesSecret.php' );    

self.addEventListener('message', handleMessage);

var dbWorker = new DbWorker();

function handleMessage( event ) 
{            
    dbWorker.handleMessage(event, function (rValue) {
        postMessage( JSON.stringify(rValue));    
    });
}