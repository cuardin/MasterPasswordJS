importScripts('core/encoding-indexes.js');
importScripts('core/encoding.js');

importScripts('core/jssha256.js');
importScripts('core/pbkdf2.js');
importScripts('core/scrypt.js');

importScripts('core/util.js');
importScripts('core/mpw.js');

self.addEventListener('message', handleMessage);

var userName = null;
var masterPassword = null;
var mpw = new MPW();

function handleMessage(event) {    
    var data = JSON.parse(event.data);                

    try {       
        if ( data.command == "compute" ) {
            if ( !(userName == data.userName && masterPassword == data.masterPassword ) ) {
                userName = data.userName;
                masterPassword = data.masterPassword;
                mpw.mpw_compute_secret_key( data.userName, data.masterPassword );  
            }
            
            var password = mpw.mpw_compute_site_password( data.siteType, data.siteName, data.siteCounter );
            postMessage( password );
        } else {
            throw new Error("Unknown command: " + data.command );            
        }
    } catch ( error ) {
        postMessage(error.message);
    }
    
}



