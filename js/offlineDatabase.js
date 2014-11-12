function Database() {    
    
    this.dbGetGlobalSeed = function()
    {
        return 1;
    };
    
    this.dbEradicateUser = function ( uName, dbPass, userEditKey ) 
    {        
    };

    this.dbForceValidateUser = function( uName, userEditKey ) 
    {     
    };

    this.dbCreateUser = function ( uName, password, email, userCreationKey, 
        response, challenge, isTest ) 
    {     
    };

    this.dbSaveSite = function ( uName, dbPass, key, value )
    {             
        /*data = JSON.parse(this.getFromLocalStorage( uName+dbPass ));        
        data[key] = value;
        localStorage.setItem( uName+dbPass, JSON.stringify(data) );*/
    };

    this.dbGetSiteList = function ( uName, dbPass ) 
    {     
        //return JSON.parse( this.getFromLocalStorage( uName+dbPass ));                
        return {};
    };

    this.dbDeleteSite = function ( uName, dbPass, siteName ) 
    {     
        /*data = JSON.parse(this.getFromLocalStorage(uName+dbPass));        
        data[siteName] = undefined;
        localStorage.setItem( uName+dbPass, JSON.stringify(data) );*/
    };
    
    /*
    this.getFromLocalStorage = function ( key ) {
        var value = localStorage.getItem(key);
        if ( value === null ) {
            value = "{}";
        }
        return value;
    };
    */
}