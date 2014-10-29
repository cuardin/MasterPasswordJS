var userName = "user01åäö";
var password = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
var email = "daniel2@armyr.se";
var antiSpamKey = "UPP7fXLerV";
var siteName = "site01.åäö";
var siteCounter = 1;
var siteType = "long";
var db = new Database();

QUnit.module( "module", {
    setup: function( assert ) {
        //Clean slate
        try {
            db.dbEradicateUser( userName, password, getPrivateKey() );
        } catch ( e ) {            
        }        
        
        //Now create a user
        db.dbCreateUser( userName, password, email, antiSpamKey, true );
                
    }, 
    teardown: function( assert ) {
        //Clean slate
        try {
            db.dbEradicateUser( userName, password );
        } catch ( e ) {}
    }
});

QUnit.test( "testCreateDuplicateEmail", function( assert ) {    
    //Arrange    
    var userName02 = "anotherUserÅÄÖ";
    
    //Act
    try {
        var result = db.dbCreateUser( userName02, password, email, antiSpamKey, true );
        assert.equal( result, "DUPLICATE_USER" );
    } catch ( e ) {
       assert.ok(false, "An exception was unexpectedly thrown.");
    } finally {
        try {
            db.dbEradicateUser( userName02, password, privateKey );
        } catch(e) { }
    }        
    
});

QUnit.test( "testCreateDuplicateUserName", function( assert ) {    
    //Arrange    
    var email02 = "another@email.com";
    
    //Act
    try {
        var result = db.dbCreateUser( userName, password, email02, antiSpamKey, true );
        assert.equal( result, "DUPLICATE_USER" );
    } catch ( e ) {
       assert.ok(false, "An exception was unexpectedly thrown.");
    } finally {
        try {
            db.dbEradicateUser( userName, password, privateKey );
        } catch(e) { }
    }        
    
});

QUnit.test( "testUploadAndGetFileListExistingUser", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    db.dbSaveSite( userName, password, siteName, JSON.stringify(site) );
   
    //Act	  
    var siteList = db.dbGetSiteList( userName, password );    
    
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
    db.dbEradicateUser( userName, password, getPrivateKey() );
   
    //Act	  
    var siteList = db.dbGetSiteList( userName, password );        
    
    //Assert    	
    assert.equal( siteList, "badLogin");    
        
});

QUnit.test( "testGetFileListBadPassword", function( assert ) {    
    
    //Arrange       
   
    //Act	  
    var siteList = db.dbGetSiteList( userName, '--');
    
    //Assert    	
    assert.equal( siteList, "badLogin");    
        
});

QUnit.test( "testDeleteFile", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    db.dbSaveSite( userName, password, siteName, JSON.stringify(site) );   
    
    //Check the arrange
    var siteList = db.dbGetSiteList( userName, password );    
    assert.notEqual( siteList[siteName], undefined );    
    
    //Act	  
    db.dbDeleteSite( userName, password, siteName );        
    
    //Assert    
    var siteList = db.dbGetSiteList( userName, password );        
    assert.equal( JSON.stringify(siteList), "[]" );    
        
});

QUnit.test( "testUploadAndOverwriteFileListExistingUser", function( assert ) {    
    
    //Arrange
    //Upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    db.dbSaveSite( userName, password, siteName, JSON.stringify(site) );
   
    //Act	  
    var siteList = db.dbGetSiteList( userName, password );    
    
    //Post-process    
    assert.notEqual( siteList[siteName], undefined );    
    
    //Act again
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter+3,
        "siteType": 'pin'};
    db.dbSaveSite( userName, password, siteName, JSON.stringify(site) );
    
    //Post-process
    var siteList = db.dbGetSiteList( userName, password );    
    assert.notEqual( siteList[siteName], undefined );    
    var siteDataStr = siteList[siteName];
    siteDataStr = siteDataStr.replace(/\\/g, '');    
    var siteData = JSON.parse( siteDataStr );    
    
    //Assert    	
    assert.equal( siteData.siteName, siteName  );
    assert.equal( siteData.siteCounter, siteCounter+3 );
    assert.equal( siteData.siteType, 'pin' );
        
});
