var userName = "user01åäö";
var password = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
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
        dbCreateTestUser( userName, email, password, antiSpamKey, privateKey );
        
        //And validate that user
        dbForceValidateUser( userName, privateKey );
        
    }, 
    teardown: function( assert ) {
        //Clean slate
        dbEradicateUser( userName, password );
    }
});

QUnit.test( "testGetFileListExistingUser", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    dbPut( userName, password, siteName, JSON.stringify(site) );
   
    //Act	  
    var siteList = dbGetSiteList( userName, password );    
    
    //Post-process
    var siteDataStr = siteList[siteName];
    siteDataStr = siteDataStr.replace(/\\/g, '');    
    var siteData = JSON.parse( siteDataStr );    
    
    //Assert    	
    assert.equal( siteData.siteName, siteName  );
    assert.equal( siteData.siteCounter, siteCounter );
    assert.equal( siteData.siteType, siteType );
        
});

QUnit.test( "testGetFileListNonExistingUser", function( assert ) {    
    
    //Arrange    
    dbEradicateUser( userName, password, privateKey );
   
    //Act	  
    var siteList = dbGetSiteList( userName, password );        
    
    //Assert    	
    assert.equal( siteList, "badLogin");    
        
});
