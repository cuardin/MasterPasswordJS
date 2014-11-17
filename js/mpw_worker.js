
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
            } else if ( data.command === "getDbPassword" ) {                            
                this.computeDbPassword( data, postReturn );
            } else if ( data.command === "siteCompute" ) {            
                this.computeSitePassword( data, postReturn );                        
            } else {
                throw new Error("Unknown command: " + data.command );            
            }
        } catch ( error ) {
            var returnValue = {};
            returnValue.type = "error";        
            returnValue.message = error.message;
            returnValue.fileName = error.fileName;
            returnValue.lineNumber = error.lineNumber;

            postReturn(returnValue);
        };
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

}