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
            
        //var password = mpw.mpw_core( data.userName, data.masterPassword, "long", data.siteName, data.siteCounter );
        
        var mpNameSpace="com.lyndir.masterpassword";
        var masterKeySalt = mpw.mpw_core_calculate_master_key_salt(mpNameSpace, userName);
        var masterKey = mpw.mpw_core_calculate_master_key(masterPassword, masterKeySalt);
  	
        //Assert
        var stringSalt = util.convertBufferToHex(masterKey);
        postMessage( stringSalt );
        
    }, 1000 );            
}



