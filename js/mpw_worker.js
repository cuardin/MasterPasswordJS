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
    setTimeout(function () {
        var data = JSON.parse(event.data);                
        var mpw = new MPW();
        var util = new Util();
        
        //var userName = util.convertBufferFromHex(data.userName);
        //var masterPassword = util.convertBufferFromHex(data.masterPassword);
          
        //postMessage( new TextEncoder("utf-8").encode(data.userName).length  );
        var password = mpw.mpw_core( data.userName, data.masterPassword, "long", data.siteName, data.siteCounter );
        
        var mpNameSpace="com.lyndir.masterpassword";
        var masterKeySalt = mpw.mpw_core_calculate_master_key_salt(mpNameSpace, data.userName);
        var masterKey = mpw.mpw_core_calculate_master_key(data.masterPassword, masterKeySalt);
  	
        //Assert
        //var stringSalt = util.convertBufferToHex(masterKey);
        postMessage( util.convertBufferToHex(masterKey) );
        
        
    }, 1000 );            
}



