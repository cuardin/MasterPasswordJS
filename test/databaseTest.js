QUnit.test( "testLogin", function( assert ) {
	//This is an official one from the RFC.
    
    //Arrange
	var userName = "user01åäö";
    var password = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
     
	//Act	  
    var siteList = dbGetSiteList( userName, password );

	//Assert    	
    assert.equal( siteList, "FAIL" );
        
});

