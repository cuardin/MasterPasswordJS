importScripts('core/encoding-indexes.js');
importScripts('core/encoding.js');

importScripts('core/jssha256.js');
importScripts('core/pbkdf2.js');
importScripts('core/scrypt.js');

importScripts('core/util.js');
importScripts('core/mpw.js');

self.addEventListener('message', handleMessage);

var mpw = new MPW();
var masterKey = null;

function postProgress( i, p )
{
    var returnValue = {};
    returnValue.type = "progress"
    returnValue.data = "" + i*100.0/p + "%";
    postMessage( JSON.stringify(returnValue) );    
}

function handleMessage(event) {    
    var data = JSON.parse(event.data);                

    try {       
        if ( data.command == "mainCompute" ) {            
            masterKey = mpw.mpw_compute_secret_key( data.userName, data.masterPassword, postProgress );  
            var returnValue = {};
            returnValue.type = "mainKey"
            returnValue.data = masterKey;
            postMessage( JSON.stringify(returnValue) );

        } else if ( data.command == "siteCompute" ) {
            var password = mpw.mpw_compute_site_password( masterKey, data.siteType, data.siteName, data.siteCounter );
            var returnValue = {};
            returnValue.type = "password"
            returnValue.data = password;
            postMessage( JSON.stringify(returnValue) );
        } else {
            throw new Error("Unknown command: " + data.command );            
        }
    } catch ( error ) {
        var returnValue = {};
        returnValue.type = "error"
        returnValue.data = error.message;
    
        postMessage(JSON.stringify(returnValue));
    }
    
}



