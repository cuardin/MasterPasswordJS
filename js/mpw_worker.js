if ( typeof importScripts === 'function') {    
    importScripts('core/encoding-indexes.js' );
    importScripts('core/encoding.js' );

    importScripts('core/jssha256.js' );    
    
    importScripts('core/scrypt-asm.js' );

    importScripts('core/util.js' );
    importScripts('core/mpw.js' );
    importScripts('database.js' );    

    self.addEventListener('message', handleMessage);
}

var webStorageSite = 'masterPasswordWebStorage';

var postProgress = function ( i, p )
{
    var returnValue = {};
    returnValue.type = "progress";
    returnValue.data = 100.0*i/p;
    postMessage( JSON.stringify(returnValue) );    
};

function postReturn(rValue) {
    postMessage( JSON.stringify(rValue));    
};

function handleMessage(event) {    
    
    var dataStr = event.data;
    var data = JSON.parse(dataStr);                
    data.masterKey = new Uint8Array( data.masterKey );
    
    var worker = new MPWWorker();
    
    try {       
        if ( data.command === "mainCompute" ) {                                    
            worker.computeMainKey( data, postProgress, postReturn );            
        } else if ( data.command === "siteCompute" ) {            
            worker.computeSitePassword( data, postReturn );                        
        } else if ( data.command === "createUser" ) {
            worker.createUser( data, postReturn );                        
        } else if ( data.command === "saveSite" ) {
            worker.saveSite( data, postReturn );                 
        } else if ( data.command === "deleteSite" ) {
            worker.deleteSite( data, postReturn );                        
        } else {
            throw new Error("Unknown command: " + data.command );            
        }
    } catch ( error ) {
        var returnValue = {};
        returnValue.type = "error";        
        returnValue.message = error.message;
        returnValue.fileName = error.fileName;
        returnValue.lineNumber = error.lineNumber;
        
        postMessage(JSON.stringify(returnValue));
    };

}

function MPWWorker() {
    this.mpw = new MPW();
    this.db = new Database();
    
    this.loadSiteList = function ( masterKey, userName, postReturn )
    {    
        var password = this.mpw.mpw_compute_site_password( masterKey, 'long', webStorageSite, 1 );
        var siteList = this.db.dbGetSiteList( userName, password );    
        if ( siteList === "badLogin" || siteList === "unvalidatedUser") {
            postReturn( {type: siteList} );
            return [];
        } else {
            postReturn( {type: "goodLogin"} );
            siteList = this.unpackSiteList( siteList );                
            return siteList; 
        }
        
    };

    this.computeMainKey = function ( data, postProgress, postReturn ) {
        //Unpack arguments
        var userName = data.userName;
        var masterPassword = data.masterPassword;
        
        //Do the thing.
        data.masterKey = this.mpw.mpw_compute_secret_key( userName, masterPassword, postProgress );              
        var siteList = this.loadSiteList( data.masterKey, userName, postReturn );
        data.masterKey = Array.apply( [], data.masterKey );
        
        //Package return values.
        var returnValue = {};        
        returnValue.type = "masterKey";
        returnValue.data = data;
        returnValue.siteList = siteList;

        postReturn(returnValue);
    };
    
    this.computeSitePassword = function ( data, postReturn )
    {                
        var password = this.mpw.mpw_compute_site_password( data.masterKey, data.siteType, data.siteName, data.siteCounter );
        var returnValue = {};
        returnValue.type = "sitePassword";
        returnValue.data = password;
        postReturn(returnValue);
    };

    this.createUser = function ( data, postReturn )
    {                
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", webStorageSite, 1 );

        //Now use the password to create a user.
        var antiSpamKey = "UPP7fXLerV";
        var rValue = this.db.dbCreateUser( data.userName, password, data.email, antiSpamKey, false);            

        var returnValue = {};
        returnValue.type = "userSubmitted";
        returnValue.data = rValue;

        postReturn(returnValue);
    };

    this.saveSite = function ( data, postReturn )
    {                
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", webStorageSite, 1 );
        
        var site = {};
        site.siteName = data.siteName;
        site.siteCounter = data.siteCounter;
        site.siteType = data.siteType;
        
        this.db.dbSaveSite( data.userName, password, data.siteName, JSON.stringify(site) );

        var returnValue = {};
        returnValue.type = "siteSaved";
        returnValue.data = site;

        postReturn(returnValue);
    };

    this.deleteSite = function ( data, postReturn )
    {        
        
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", webStorageSite, 1 );

        this.db.dbDeleteSite( data.userName, password, data.siteName );

        var returnValue = {};
        returnValue.type = "siteDeleted";
        returnValue.data = data.siteName;

        postReturn(returnValue);
    };

    this.unpackSiteList = function ( siteList ) {
        var site = {};

        //Add the site names to their list.
        keys = Object.keys(siteList);
        for ( var i = 0; i < keys.length; i++ ) {        
            var siteName = keys[i];
            var siteString = siteList[siteName];
            siteString = siteString.replace(/\\/g, '');    
            site[siteName] = JSON.parse(siteString);        
        }
        return site;
    };
}