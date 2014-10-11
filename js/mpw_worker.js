if ( typeof importScripts === 'function') {
    var c = '?a=7';
    importScripts('core/encoding-indexes.js' + c );
    importScripts('core/encoding.js' + c );

    importScripts('core/jssha256.js' + c);
    importScripts('core/pbkdf2.js' + c);
    importScripts('core/scrypt.js' + c);

    importScripts('core/util.js' + c);
    importScripts('core/mpw.js' + c);
    importScripts('database.js' + c);

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

function handleMessage(event) {    
    
    var data = JSON.parse(event.data);                
    var worker = new MPWWorker();
    
    try {       
        if ( data.command === "mainCompute" ) {                                    
            var returnValue = worker.computeMainKey( data.userName, data.masterPassword, postProgress );
            postMessage( JSON.stringify(returnValue) );

        } else if ( data.command === "siteCompute" ) {
            var returnValue = worker.computeSitePassword( data.masterKey, data.siteType, data.siteName, data.siteCounter );            
            postMessage( JSON.stringify(returnValue) );

        } else if ( data.command === "createUser" ) {
            var returnValue = worker.createUser( data.masterKey, data.userName, data.email );            
            postMessage( JSON.stringify(returnValue) );

        } else if ( data.command === "saveSite" ) {
            var returnValue = worker.saveSite( data.masterKey, data.userName, data.site );     
            postMessage( JSON.stringify(returnValue) );        

        } else if ( data.command === "deleteSite" ) {
            var returnValue = worker.deleteSite( data.masterKey, data.userName, data.siteName );            
            postMessage( JSON.stringify(returnValue) );        

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
    
    this.loadSiteList = function ( masterKey, userName )
    {    
        var password = this.mpw.mpw_compute_site_password( masterKey, 'long', webStorageSite, 1 );
        var siteList = this.db.dbGetSiteList( userName, password );    
        if ( siteList === "badLogin") {
            return siteList;
        } else {
            var siteList = this.unpackSiteList( siteList );    
            return siteList; 
        }
    };

    this.computeMainKey = function ( userName, masterPassword, postProgress ) {
        var masterKey = this.mpw.mpw_compute_secret_key( userName, masterPassword, postProgress );              
        var siteList = this.loadSiteList( masterKey, userName );

        var returnValue = {};
        returnValue.type = "masterKey";
        returnValue.data = masterKey;            
        returnValue.siteList = siteList;

        return returnValue;
    };
    
    this.computeSitePassword = function ( masterKey, siteType, siteName, siteCounter )
    {
        var password = this.mpw.mpw_compute_site_password( masterKey, siteType, siteName, siteCounter );
        var returnValue = {};
        returnValue.type = "sitePassword";
        returnValue.data = password;
        return returnValue;
    };

    this.createUser = function ( masterKey, userName, email )
    {
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );

        //Now use the password to create a user.
        var antiSpamKey = "UPP7fXLerV";
        var rValue = this.db.dbCreateUser( userName, password, email, antiSpamKey, false);            

        var returnValue = {};
        returnValue.type = "userSubmitted";
        returnValue.data = rValue;

        return returnValue;
    };

    this.saveSite = function ( masterKey, userName, site )
    {
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );

        this.db.dbSaveSite( userName, password, site.siteName, JSON.stringify(site) );

        var returnValue = {};
        returnValue.type = "siteSaved";
        returnValue.data = site;

        return returnValue;
    };

    this.deleteSite = function ( masterKey, userName, siteName  )
    {
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );

        this.db.dbDeleteSite( userName, password, siteName );

        var returnValue = {};
        returnValue.type = "siteDeleted";
        returnValue.data = siteName;

        return returnValue;
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