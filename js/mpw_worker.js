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

function handleMessage(event) {    
    var data = JSON.parse(event.data);                
    var mpw = new MPW();

    var password = mpw.mpw_core( data.userName, data.masterPassword, "long", data.siteName, data.siteCounter );
    postMessage( password );
}



