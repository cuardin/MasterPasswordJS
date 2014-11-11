function Database() {
    this.storage = window.localStorage;
    
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
        data = JSON.parse(this.getFromLocalStorage( uName+dbPass ));        
        data[key] = value;
        this.storage.setItem( uName+dbPass, JSON.stringify(data) );
    };

    this.dbGetSiteList = function ( uName, dbPass ) 
    {     
        return JSON.parse( this.getFromLocalStorage( uName+dbPass ));                
    };

    this.dbDeleteSite = function ( uName, dbPass, siteName ) 
    {     
        data = JSON.parse(this.getFromLocalStorage(uName+dbPass));        
        data[siteName] = undefined;
        this.storage.setItem( uName+dbPass, JSON.stringify(data) );
    };
    
    this.getFromLocalStorage = function ( key ) {
        var value = this.storage.getItem(key);
        if ( value === null ) {
            value = "{}";
        }
        return value;
    };
}