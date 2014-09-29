var rootAdress = "http://192.168.56.101/php_scripts/";

function dbEradicateUser( uName, dbPass ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&password=" + dbPass;
    var completeAddress = rootAdress + "eradicateUser.php?" + arguments;    
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
}

function forceValidateUser( uName, privateKey ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&email=" + email + 
            "&userCreationKey=" + userCreationKey +
            "&password=" + password +
            "&test=true";
    var completeAddress = rootAdress + "createUser.php?" + arguments;    
    console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
}

function dbCreateTestUser( uName, email, password, userCreationKey ) 
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&email=" + email + 
            "&userCreationKey=" + userCreationKey +
            "&password=" + password +
            "&test=true";
    var completeAddress = rootAdress + "createUser.php?" + arguments;    
    console.log( completeAddress );
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
    
}

function dpPut( uName, dbPass, key, value )
{
    var xmlhttp = new XMLHttpRequest();
    var arguments = "username=" + uName + "&email=" + email + 
            "&userCreationKey=" + userCreationKey +
            "&password=" + password;
    var completeAddress = rootAdress + "createUser.php?" + arguments;    
    xmlhttp.open("GET",completeAddress,false);
    xmlhttp.send();
}

function dbGetSiteList( uName, dbPass ) 
{
	var xmlhttp = new XMLHttpRequest();
	var arguments = "username=" + uName + "&password=" + dbPass;	
	var completeAddress = rootAdress + "listFiles.php?" + arguments; 
	console.log( completeAddress );
	xmlhttp.open("GET",completeAddress,false);
        xmlhttp.send();
	var rValue = xmlhttp.responseText;
	console.log( rValue );
	/*try {
		rValue = JSON.parse();
	} catch ( e ) {
		//Do nothing
	}*/
	return rValue;
}