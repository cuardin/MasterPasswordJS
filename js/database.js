function Database() {
    
    
    this.dbEradicateUser = function ( uName, dbPass, userEditKey ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass + "&userEditKey=" + userEditKey;
        var completeAddress = getRootAddress() + "eradicateUser.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbForceValidateUser = function( uName, userEditKey ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&email=" + email + 
                "&userEditKey=" + userEditKey;            
        var completeAddress = getRootAddress() + "verifyEmail.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );    
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbCreateUser = function ( uName, password, email, userCreationKey, 
        response, challenge, isTest ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&email=" + email + 
            "&userEditKey=" + userCreationKey +
            "&password=" + password + 
            "&recaptcha_response_field=" + response +
            "&recaptcha_challenge_field=" + challenge;
        if ( isTest ) {
            arguments = arguments + "&test=true";
        }
        var completeAddress = getRootAddress() + "createUser.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;        
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else if ( rValue.substr(0,14) === "DUPLICATE_USER") {
            return "DUPLICATE_USER";
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
        var completeAddress = getRootAddress() + "uploadFile.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("Error: " + rValue);            
        }
    };

    this.dbGetSiteList = function ( uName, dbPass ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass;	
        var completeAddress = getRootAddress() + "listFiles.php?" + arguments; 
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        if ( rValue.substring(0,4) === "FAIL") {
            if ( rValue === "FAIL: BAD_LOGIN" ) {
                return "badLogin";            
            } else {
               throw new Error("Error: " + rValue);   
            }
        }
        try {
            rValue = JSON.parse(rValue);        
        } catch ( e ) {
            return "badData";
            
        }
        return rValue;
    };

    this.dbDeleteSite = function ( uName, dbPass, siteName ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + uName + "&password=" + dbPass + "&fileName=" + siteName;
        var completeAddress = getRootAddress() + "deleteFile.php?" + arguments;    
        //console.log( completeAddress );
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("Error: " + rValue);            
        }
    };
}