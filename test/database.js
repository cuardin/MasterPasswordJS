var rootAdress = "http://masterpassword.armyr.se/php_scripts/";

function dbGetSiteList( uName, dbPass ) 
{
	var xmlhttp = new XMLHttpRequest();

	var arguments = "username=" + uName + "&password=" + dbPass;
	
	var completeAddress = rootAdress + "listFiles.php?" + arguments 
	console.log( completeAddress );
	xmlhttp.open("GET",completeAddress,false);
	var rValue = xmlhttp.responseText;
	console.log( rValue );
	/*try {
		rValue = JSON.parse();
	} catch ( e ) {
		//Do nothing
	}*/
	return rValue;
}