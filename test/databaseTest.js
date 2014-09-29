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
        //dbEradicateUser( userName, password );
        
        //Now create a user
        dbCreateTestUser( userName, email, password, antiSpamKey, privateKey );
        
        //And validate that user
        
        
        //And upload a file
        var site = {};
        site.siteName = siteName;
        site.siteCounter = siteCounter;
        site.siteType = siteType;
        
        //dbPut( userName, password, siteName, JSON.stringify(site) );
    }, 
    teardown: function( assert ) {
        //Clean slate
        //dbEradicateUser( userName, password );
    }
});
QUnit.test( "testetFileListExistingUser", function( assert ) {    
    
    //Arrange
    
    //Act	  
    var siteList = dbGetSiteList( userName, password );

	//Assert    	
    assert.equal( siteList, "FAIL" );
        
});

