
function MPWWorker() {
    this.webStorageSite = 'masterPasswordWebStorage';
    this.masterKey = new Uint8Array();

    this.mpw = new MPW();
    this.db = new Database();
    
    this.postProgress = function ( i, p )
    {
        var returnValue = {};
        returnValue.type = "progress";
        returnValue.data = 100.0*i/p;
        postMessage( JSON.stringify(returnValue) );    
    };

    this.handleMessage = function(event, postReturn) {    

        var dataStr = event.data;
        var data = JSON.parse(dataStr);                
        data.masterKey = this.masterKey;       

        try {       
            if ( data.command === "mainCompute" ) {                                    
                this.computeMainKey( data, this.postProgress, postReturn );            
            } else if ( data.command === "getSiteList" ) {
                this.loadSiteList( data, postReturn );
            } else if ( data.command === "getDbPassword" ) {                            
                this.computeDbPassword( data, postReturn );
            } else if ( data.command === "siteCompute" ) {            
                this.computeSitePassword( data, postReturn );                        
            } else if ( data.command === "createUser" ) {
                this.createUser( data, postReturn );                        
            } else if ( data.command === "saveSite" ) {
                this.saveSite( data, postReturn );                 
            } else if ( data.command === "deleteSite" ) {
                this.deleteSite( data, postReturn );                        
            } else {
                throw new Error("Unknown command: " + data.command );            
            }
        } catch ( error ) {
            var returnValue = {};
            returnValue.type = "error";        
            returnValue.message = error.message;
            returnValue.fileName = error.fileName;
            returnValue.lineNumber = error.lineNumber;

            postReturn(JSON.stringify(returnValue));
        };
    };

    this.loadSiteList = function ( data, postReturn )
    {            
        //var password = this.mpw.mpw_compute_site_password( data.masterKey, 'long', this.webStorageSite, this.db.dbGetGlobalSeed() );
        var siteList = this.db.dbGetSiteList( data.userName, data.dbPassword );    
        if ( siteList === "badLogin") {
            postReturn( {type: "badLogin"} );
        } else {
            postReturn( {type: "goodLogin"} );
            siteList = this.unpackSiteList( siteList );                
            
            var returnValue = {};        
            returnValue.type = "siteList";
            returnValue.siteList = siteList;        
            postReturn( returnValue );
        }
        
    };

    this.computeMainKey = function ( data, postProgress, postReturn ) {
        //Unpack arguments
        var userName = data.userName;
        var masterPassword = data.masterPassword;
        
        //Do the thing.
        this.masterKey = this.mpw.mpw_compute_secret_key( userName, masterPassword, postProgress );                              
        
        //Package return values.
        var returnValue = {};        
        returnValue.type = "masterKey";
        //returnValue.data = data;
                
        postReturn(returnValue);        
    };
    
    this.computeDbPassword = function ( data, postReturn )
    {                
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", this.webStorageSite, this.db.dbGetGlobalSeed() );                        

        var returnValue = {};
        returnValue.type = "dbPassword";
        returnValue.data = password;
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

    this.createUser = function ( data, postReturn, antiSpamKey )
    {                
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", this.webStorageSite, this.db.dbGetGlobalSeed() );

        //Now use the password to create a user.        
        var rValue = this.db.dbCreateUser( data.userName, password, data.email, 
            antiSpamKey, data.capchaResponse, data.capchaChallenge, false);            

        var returnValue = {};
        returnValue.type = "userSubmitted";
        returnValue.data = rValue;

        postReturn(returnValue);
    };

    this.saveSite = function ( data, postReturn )
    {                
        //Compute the password to be used to identify this user.
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", this.webStorageSite, this.db.dbGetGlobalSeed() );
        
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
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", this.webStorageSite, this.db.dbGetGlobalSeed() );

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