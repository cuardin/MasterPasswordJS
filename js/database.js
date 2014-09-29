//Populate a database
var database = {};
var site01 = {}; site01.siteName = "site01.com"; site01.siteCounter = 1; site01.siteType = "long"; 
database["site01.com"] = site01;
var site02 = {}; site02.siteName = "site02.com"; site02.siteCounter = 3; site02.siteType = "pin"; 
database["site02.com"] = site02;

//Store a user
var userName = "user01åäö";
var databasePassword = "BopvPeln3~Rima" //Add the database password. site: masterPasswordWebStorage

//Function to create a new user
function dbCreateUser( uName, dbPass, email ) 
{
	//STUB.
    return true;
}

//Function to get list of site-infos
function dbGetSiteList( uName, dbPass ) 
{
	if ( uName == userName && dbPass == databasePassword ) {
		return database;
	} else {
		if ( uName != userName ) {
            return "badUserName"
        } else {
            return "badPassword";
        }
	}
}

//Function to replace a site-info
function dbSaveSite( uName, dbPass, site ) 
{	
	var done = false;
	for ( var i = 0; i < database.size; i++ ) {
		if ( database[i].siteName == site.siteName ) {
			database[i] = site;
			done = true;
		}
	}
	if ( !done ) {
		database[database.length] = site;
	}
}

function dbDeleteSite( uName, dbPass, siteName ) 
{	
	var done = false;
	for ( var i = 0; i < database.size; i++ ) {
		if ( database[i].siteName == site.siteName ) {
			database.splice(i,i);
			return;
		}
	}
}


