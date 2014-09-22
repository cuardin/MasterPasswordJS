//Populate a database
var database = [];
var site01 = {}; site01.siteName = "site01.com"; site01.siteCounter = 1; site01.siteType = "long"; 
database[0] = site01;
var site02 = {}; site02.siteName = "site02.com"; site02.siteCounter = 3; site02.siteType = "pin"; 
database[1] = site02;

//Store a user
var userName = "user01åäö";
var databasePassword = "BopvPeln3~Rima" //Add the database password. site: masterPasswordWebStorage

//Function to get list of site-infos
function dbGetSiteList( uName, dbPass ) 
{
	if ( uName == userName && dbPass == databasePassword ) {
		return database;
	} else {
		return null;
	}
}

//Function to replace a site-info
function dbReplaceSiteList( uName, dbPass, oldSite, newSite ) 
{
	if ( isNaN(oldSite) ) {
		//Add the site
		database[database.length] = newSite;
	} else {
		var done = false;
		for ( var i = 0; i < database.size; i++ ) {
			if ( database[i] == oldSite ) {
				database[i] = newSite;
				done = false;
			}
		}
		if ( !done ) {
			database[database.length] = newSite;
		}
	}
}

