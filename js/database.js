function Database() {
    this.rootAdress = "http://192.168.56.101/php_scripts/";
    
    this.dbEradicateUser = function ( uName, dbPass, privateKey ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass + "&privateKey=" + privateKey;
        var completeAddress = this.rootAdress + "eradicateUser.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return;
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbForceValidateUser = function( uName, privateKey ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&email=" + email + 
                "&privateKey=" + privateKey;            
        var completeAddress = this.rootAdress + "verifyEmail.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );    
        if ( rValue.substr(0,2) === "OK" ) {
            return;
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbCreateUser = function ( uName, password, email, userCreationKey, isTest ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&email=" + email + 
            "&userCreationKey=" + userCreationKey +
            "&password=" + password;
        if ( isTest ) {
            arguments = arguments + "&test=true";
        }
        var completeAddress = this.rootAdress + "createUser.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;        
        if ( rValue.substr(0,2) === "OK" ) {
            return;
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbSaveSite = function ( uName, dbPass, key, value )
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + 
                "&password=" + dbPass +
                "&fileName=" + key + 
                "&fileContents=" + value;
        var completeAddress = this.rootAdress + "uploadFile.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return;
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbGetSiteList = function ( uName, dbPass ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass;	
        var completeAddress = this.rootAdress + "listFiles.php?" + arguments; 
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        try {
            rValue = JSON.parse(rValue);        
        } catch ( e ) {
            //console.log( rValue );
            rValue = "badLogin";
        }
        return rValue;
    };

    this.dbDeleteSite = function ( uName, dbPass, siteName ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass + "&fileName=" + siteName;
        var completeAddress = this.rootAdress + "deleteFile.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return;
        } else {
            throw new Error("Error: " + rValue);            
        }
    };
}