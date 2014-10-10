var userName = "user01åäö";
var masterPassword = "MasterPass01";
var password = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
var masterKey = JSON.parse("[145,36,81,10,63,247,78,149,181,68,118,134,247,23,197,43,213,246,179,150,118,5,68,114,191,139,168,58,114,205,105,114,183,144,98,157,229,68,217,77,30,95,16,93,140,116,162,73,16,217,68,9,156,244,32,77,171,22,172,15,234,187,23,176]");
var email = "daniel@armyr.se";
var antiSpamKey = "UPP7fXLerV"
var siteName = "site01.åäö"
var siteCounter = 1;
var siteType = "long";
var db = new Database();
var worker = {};

QUnit.module( "module", {
    setup: function( assert ) {
        //Clean slate
        try {
            db.dbEradicateUser( userName, password, privateKey );
        } catch ( e ) {}
        
        //Now create a user
        db.dbCreateUser( userName, password, email, antiSpamKey, true );
        
        //And validate that user
        db.dbForceValidateUser( userName, privateKey );
        
        //And make sure we have a worker object
        worker = new MPWWorker();
        
    }, 
    teardown: function( assert ) {
        //Clean slate
        try {
            db.dbEradicateUser( userName, password );
        } catch ( e ) {}
        
        //And make sure we clean up our worker
        worker = {};
    }
});


QUnit.test( "testLoadSiteList", function( assert ) {    
    
    //Arrange
    //And upload a file
    var site = { "siteName": siteName, 
        "siteCounter": siteCounter,
        "siteType": siteType};
    db.dbSaveSite( userName, password, siteName, JSON.stringify(site) );    
    
    //Act
    var siteList = worker.loadSiteList( masterKey, userName );    
    
    //Assert
    assert.equal(siteList[siteName].siteName, siteName );
    assert.equal(siteList[siteName].siteCounter, siteCounter );
    assert.equal(siteList[siteName].siteCounter, siteCounter );
        
});


QUnit.test( "loadSiteListNonExistingUser", function( assert ) {    
    
    //Arrange    
    db.dbEradicateUser( userName, password, privateKey );
   
    //Act	  
    var siteList = worker.loadSiteList( masterKey, userName );    
    
    //Assert    	
    assert.equal( siteList, "badLogin");    
        
});

QUnit.test( "testComputeMainKey", function( assert ) {    
    
    //Arrange        
    worker.mpw.mpw_compute_secret_key = function(uName, mPassword, pProgress ) {
        if ( uName === userName && mPassword === masterPassword ) {
            return masterKey;
        }
    };
   
    //Act	  
    var rValue = worker.computeMainKey( userName, masterPassword, null );
    
    //Assert    	
    assert.equal( rValue.type, "masterKey" );    
    assert.equal( rValue.data, masterKey );    
        
});

QUnit.test( "testComputeSitePassword", function( assert ) {    
    
    //Arrange            
   
    //Act	  
    var rValue = worker.computeSitePassword( masterKey, siteType, siteName, siteCounter);
    
    //Assert    	
    assert.equal( rValue.type, "sitePassword" );    
    assert.equal( rValue.data, "Gink2^LalqZuza" );    
        
});

QUnit.test( "testCreateUser", function( assert ) {    
    
    //Arrange        
    //Mock the database connection
    worker.db.dbCreateUser = function dbCreateUser( userName, password, email, antiSpamKey, fun )
    {
        return userName + password + email + antiSpamKey + fun;
    };
   
    //Act	  
    var rValue = worker.createUser( masterKey, userName, email );
    
    //Assert    	
    assert.equal( rValue.type, "userSubmitted" );    
    assert.equal( rValue.data, userName + password + email + antiSpamKey + false );    
        
});

QUnit.test("testSaveSite", function( assert ) {    
    var site = { "siteName": siteName, "siteType": siteType, "siteCounter": siteCounter };
    
    worker.db.dbSaveSite = function ( uName, dbPass, key, value )
    {
        if ( uName === userName && dbPass === password && key === siteName && value == JSON.stringify(site) ) {
            return "OK";
        } else {            
            throw new Error("Error: ")
        }
    };
    
    var rValue = worker.saveSite( masterKey, userName, site );
    
    //Assert    
    assert.equal( rValue.type, "siteSaved" );    
    assert.equal( rValue.data, site );    
    
});

QUnit.test("testDeleteSite", function( assert ) {    
    
    
    worker.db.dbDeleteSite = function ( uName, dbPass, sName )
    {
        if ( uName === userName && dbPass === password && sName === siteName  ) {
            return "OK";
        } else {            
            throw new Error("Error: ");
        }
    };
    
    var rValue = worker.deleteSite( masterKey, userName, siteName );
    
    //Assert    
    assert.equal( rValue.type, "siteDeleted" );    
    assert.equal( rValue.data, siteName );    
    
});

QUnit.test( "testUnpackSiteList", function( assert ) {    
    
    //Arrange    
    var siteList = {"site01.åäö":"{\\\"siteName\\\":\\\"site01.åäö\\\",\\\"siteCounter\\\":1,\\\"siteType\\\":\\\"long\\\"}"};
       
    //Act	  
    var unpackedSiteList = worker.unpackSiteList( siteList );
    
    //Assert    	
    assert.equal( unpackedSiteList["site01.åäö"].siteName, "site01.åäö");
    assert.equal( unpackedSiteList["site01.åäö"].siteCounter, 1);
    assert.equal( unpackedSiteList["site01.åäö"].siteType, "long");
    
        
});
