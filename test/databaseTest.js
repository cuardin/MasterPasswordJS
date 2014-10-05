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
        dbCreateUser( userName, password, email, antiSpamKey, true );
        
        //And validate that user
        dbForceValidateUser( userName, privateKey );
        
    }, 
    teardown: function( assert ) {
        //Clean slate
        dbEradicateUser( userName, password );
    }
});

QUnit.test( "testUploadAndGetFileListExistingUser", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    dbSaveSite( userName, password, siteName, JSON.stringify(site) );
   
    //Act	  
    var siteList = dbGetSiteList( userName, password );    
    
    //Post-process
    assert.notEqual( siteList[siteName], undefined );    
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

QUnit.test( "testDeleteFile", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    dbSaveSite( userName, password, siteName, JSON.stringify(site) );   
    
    //Check the arrange
    var siteList = dbGetSiteList( userName, password );    
    assert.notEqual( siteList[siteName], undefined );    
    
    //Act	  
    dbDeleteSite( userName, password, siteName );        
    
    //Assert    
    var siteList = dbGetSiteList( userName, password );        
    assert.equal( JSON.stringify(siteList), "[]" );    
        
});

QUnit.test( "testUploadAndOverwriteFileListExistingUser", function( assert ) {    
    
    //Arrange
    //Upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    dbSaveSite( userName, password, siteName, JSON.stringify(site) );
   
    //Act	  
    var siteList = dbGetSiteList( userName, password );    
    
    //Post-process    
    assert.notEqual( siteList[siteName], undefined );    
    
    //Act again
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter+3,
        "siteType": 'pin'};
    dbSaveSite( userName, password, siteName, JSON.stringify(site) );
    
    //Post-process
    var siteList = dbGetSiteList( userName, password );    
    assert.notEqual( siteList[siteName], undefined );    
    var siteDataStr = siteList[siteName];
    siteDataStr = siteDataStr.replace(/\\/g, '');    
    var siteData = JSON.parse( siteDataStr );    
    
    //Assert    	
    assert.equal( siteData.siteName, siteName  );
    assert.equal( siteData.siteCounter, siteCounter+3 );
    assert.equal( siteData.siteType, 'pin' );
        
});
