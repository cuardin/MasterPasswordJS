importScripts('core/encoding-indexes.js' );
importScripts('core/encoding.js' );

//This is the compiles non-auditable version.
//importScripts('core/scrypt-asm.js' );
//importScripts('core/scrypt-wrapper.js' );    

//Use the auditable scrypt version.
importScripts('core/scrypt.js' );

importScripts('core/util.js' );
importScripts('core/mpw.js' );
importScripts('database.js' );    
importScripts('mpw_worker.js' );    
importScripts('../js/utilitiesSecret.php' );    

self.addEventListener('message', handleMessage);

function handleMessage( event ) 
{
    var worker = new MPWWorker();
    worker.handleMessage(event, function (rValue) {
        postMessage( JSON.stringify(rValue));    
    });
}
