var userName = "user01åäö";
var password = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
var masterKey = JSON.parse("[145,36,81,10,63,247,78,149,181,68,118,134,247,23,197,43,213,246,179,150,118,5,68,114,191,139,168,58,114,205,105,114,183,144,98,157,229,68,217,77,30,95,16,93,140,116,162,73,16,217,68,9,156,244,32,77,171,22,172,15,234,187,23,176]");
var email = "daniel@armyr.se";
var antiSpamKey = "UPP7fXLerV"
var siteName = "site01.åäö"
var siteCounter = 1;
var siteType = "long";

QUnit.module( "module", {
    setup: function( assert ) {
        //Clean slate
        dbEradicateUser( userName, password, privateKey );
        
        //Now create a user
        dbCreateUser( userName, password, email, antiSpamKey, true );
        
        //And validate that user
        dbForceValidateUser( userName, privateKey );
        
    }, 
    teardown: function( assert ) {
        //Clean slate
        //dbEradicateUser( userName, password );
    }
});

QUnit.test( "testLoadSiteList", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    dbSaveSite( userName, password, siteName, JSON.stringify(site) );    
    
    //Act
    var siteList = loadSiteList( masterKey, userName );
    siteList = JSON.parse(siteList[site.siteName]);
    
    //Assert
    assert.equal(siteList.siteName, site.siteName );
        
});
/*
QUnit.test( "testGetFileListNonExistingUser", function( assert ) {    
    
    //Arrange    
    dbEradicateUser( userName, password, privateKey );
   
    //Act	  
    var siteList = dbGetSiteList( userName, password );        
    
    //Assert    	
    assert.equal( siteList, "badLogin");    
        
});

*/