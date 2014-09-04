importScripts('core/encoding-indexes.js');
importScripts('core/encoding.js');

importScripts('core/jssha256.js');
importScripts('core/pbkdf2.js');
importScripts('core/scrypt.js');

importScripts('core/util.js');
importScripts('core/mpw.js');

self.addEventListener('message', handleMessage);

function handleMessage(event) {    
    var data = JSON.parse(event.data);                
    var mpw = new MPW();
    
    try {        
        var password = mpw.mpw_core( data.userName, data.masterPassword, data.siteType, data.siteName, data.siteCounter );
        postMessage( password );
    } catch ( error ) {
        postMessage(error.message);
    }
    
}



