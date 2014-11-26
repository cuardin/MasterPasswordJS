function Database() {
        
    this.dbEradicateUser = function ( uName, dbPass, userEditKey ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + encodeURIComponent(uName) + 
                "&password=" + encodeURIComponent(dbPass) + 
                "&userEditKey=" + encodeURIComponent(userEditKey) +
                "?d=" + Math.floor(Math.random()*1000001); //Force IE to reload                    
        var completeAddress = getRootAddress() + "eradicateUser.php?" + arguments;            
        //console.log( completeAddress );
        
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("DbError: " + rValue);            
        }
    };

    this.dbCreateUser = function ( uName, password, email, userCreationKey, 
        response, challenge, isTest ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + encodeURIComponent(uName) + 
            "&email=" + encodeURIComponent(email) +             
            "&userEditKey=" + encodeURIComponent(userCreationKey) +  //For the unit tests as an alternative to capcha.
            "&password=" + encodeURIComponent(password) + 
            "&recapcha_response_field=" + encodeURIComponent(response) +
            "&recapcha_challenge_field=" + encodeURIComponent(challenge) +
            "&d=" + Math.floor(Math.random()*1000001); //Force IE to reload
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
            throw new Error("DbError: " + rValue);            
        }
    };

    this.dbSaveSite = function ( uName, dbPass, key, value )
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + encodeURIComponent(uName) + 
                "&password=" + encodeURIComponent(dbPass) +
                "&fileName=" + encodeURIComponent(key) + 
                "&fileContents=" + encodeURIComponent(value) +
                "&d=" + Math.floor(Math.random()*1000001); //Force IE to reload
        var completeAddress = getRootAddress() + "uploadFile.php?" + arguments;            
        //console.log( completeAddress );
        
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("DbError: " + rValue);            
        }
    };

    this.dbGetSiteList = function ( uName, dbPass ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + encodeURIComponent(uName) + 
                "&password=" + encodeURIComponent(dbPass) +
                "&d=" + Math.floor(Math.random()*1000001); //Force IE to reload        
        var completeAddress = getRootAddress() + "listFiles.php?" + arguments;         
        //console.log( completeAddress );
        
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        if ( rValue.substring(0,4) === "FAIL") {
            if ( rValue === "FAIL: BAD_LOGIN" ) {
                return "badLogin";            
            } else {
               throw new Error("DbError: " + rValue);   
            }
        }
        try {
            rValue = JSON.parse(rValue);        
        } catch ( error ) {
            throw new Error("DbError: " + error.message);   
            
        }
        return rValue;
    };

    this.dbDeleteSite = function ( uName, dbPass, siteName ) 
    {
        var xmlhttp = new XMLHttpRequest();
        var arguments = "username=" + encodeURIComponent(uName) + 
                "&password=" + encodeURIComponent(dbPass) + 
                "&fileName=" + encodeURIComponent(siteName) +
                "&d=" + Math.floor(Math.random()*1000001); //Force IE to reload
        var completeAddress = getRootAddress() + "deleteFile.php?" + arguments;            
        //console.log( completeAddress );
        
        xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
        var rValue = xmlhttp.responseText;
        //console.log( rValue );
        if ( rValue.substr(0,2) === "OK" ) {
            return "OK";
        } else {
            throw new Error("DbError: " + rValue);            
        }
    };
}