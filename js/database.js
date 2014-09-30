var rootAdress = "http://192.168.56.101/php_scripts/";

function dbEradicateUser( uName, dbPass, privateKey ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&password=" + dbPass + "&privateKey=" + privateKey;
    var completeAddress = rootAdress + "eradicateUser.php?" + arguments;    
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );
}

function dbForceValidateUser( uName, privateKey ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&email=" + email + 
            "&privateKey=" + privateKey;            
    var completeAddress = rootAdress + "verifyEmail.php?" + arguments;    
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );    
}

function dbCreateUser( uName, password, email, userCreationKey, isTest ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&email=" + email + 
        "&userCreationKey=" + userCreationKey +
        "&password=" + password;
    if ( isTest ) {
        arguments = arguments + "&test=true";
    }
    var completeAddress = rootAdress + "createUser.php?" + arguments;    
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );
}

function dbSaveSite( uName, dbPass, key, value )
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + 
            "&password=" + password +
            "&fileName=" + key + 
            "&fileContents=" + value;
    var completeAddress = rootAdress + "uploadFile.php?" + arguments;    
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );
}

function dbGetSiteList( uName, dbPass ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&password=" + dbPass;	
    var completeAddress = rootAdress + "listFiles.php?" + arguments; 
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );
    try {
            rValue = JSON.parse(rValue);                
    } catch ( e ) {
            console.log( rValue );
            rValue = "badLogin"
    }
    return rValue;
}

function dbDeleteSite( uName, dbPass, siteName ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&password=" + dbPass + "&fileName=" + siteName;
    var completeAddress = rootAdress + "deleteFile.php?" + arguments;    
    //console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    var rValue = xmlhttp.responseText;
    //console.log( rValue );
}
