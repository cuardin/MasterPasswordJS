if ( typeof importScripts === 'function') {    
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
}

var webStorageSite = 'masterPasswordWebStorage';
var masterKey = new Uint8Array();

var postProgress = function ( i, p )
{
    var returnValue = {};
    returnValue.type = "progress";
    returnValue.data = 100.0*i/p;
    postMessage( JSON.stringify(returnValue) );    
};

function handleMessage( event ) 
{
    var worker = new MPWWorker();
    worker.handleMessage(event, function (rValue) {
        postMessage( JSON.stringify(rValue));    
    });
}
