
function MPWWorker() {
    this.webStorageSite = 'masterPasswordWebStorage';
    this.masterKey = new Uint8Array();

    this.mpw = new MPW();    
    
    this.postProgress = function ( i )
    {
        var returnValue = {};
        returnValue.type = "progress";
        returnValue.data = 100*i;
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
            returnValue.message = "MPW: " + error.message;
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
        var password = this.mpw.mpw_compute_site_password( data.masterKey, "long", this.webStorageSite, this.getGlobalSeed() );

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

    this.getGlobalSeed = function()
    {
        try {
            var xmlhttp = new XMLHttpRequest();        
            var completeAddress = getRootAddress() + "getSeed.php" +
                    "?d=" + Math.floor(Math.random()*1000001); //Force IE to reload                    
            completeAddress = encodeURI(completeAddress);

            xmlhttp.open("GET",completeAddress,false);
            xmlhttp.send();
            var rValue = xmlhttp.responseText;
            return parseInt( rValue );                    
        } catch ( error ) {
            //This function should not throw an exception. IF we can't acces the network, the global seed is irrelevant.            
            console.log( "Error getting global seed from server. Returning 1.");
            return 1;
        }
    };

}