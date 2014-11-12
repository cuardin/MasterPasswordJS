//TODO: Make all tests pass with mocked call to getGlobalSiteSeed();
//TODO: Set the database object to an empty object to make sure all database calls are mocked.

var data = {};


var worker = {};

QUnit.module( "module", {
    setup: function( assert ) {
        //And make sure we have a worker object
        worker = new MPWWorker();
        worker.db = {}; //We want to mock db completely.
        data.userName = "user01åäö";
        data.masterPassword = "MasterPass01";
        data.dbPassword = "BopvPeln3~Rima"; //"MasterPass01", counter 1, type long, site: masterPasswordWebStorage
        data.masterKey = new Uint8Array(JSON.parse("[145,36,81,10,63,247,78,149,181,68,118,134,247,23,197,43,213,246,179,150,118,5,68,114,191,139,168,58,114,205,105,114,183,144,98,157,229,68,217,77,30,95,16,93,140,116,162,73,16,217,68,9,156,244,32,77,171,22,172,15,234,187,23,176]"));
        data.email = "daniel2@armyr.se";        
        data.capchaResponse = "capcha_response";        
        data.capchaChallenge = "capcha_challenge";        
        data.siteName = "site01.åäö";
        data.siteCounter = 1;
        data.siteType = "long";        
        
        //Allways mock the getGlobalSeed.
        worker.db.dbGetGlobalSeed = function ( ) { 
            assert.ok( true ); //Just want to check that we were called.
            return data.siteCounter;
        };

    }, 
    teardown: function( assert ) {
        //And make sure we clean up our worker
        worker = {};
    }
});


QUnit.test( "testLoadSiteList", function( assert ) {    
    QUnit.expect(5);
    
    //Arrange
    //And upload a file    
    worker.db.dbGetSiteList = function ( uName, pword ) {
        if ( uName === data.userName && pword === data.dbPassword ) {
            var site = { "siteName": data.siteName, 
                "siteCounter": data.siteCounter,
                "siteType": data.siteType};
            var rValue = {};
            rValue[data.siteName] = JSON.stringify(site);
            return rValue;
        } else {
            throw Error("Error!");
        }
    };        
               
    //Act
    worker.loadSiteList( data, function(rValue){        
        //Assert    	
        if ( rValue.type === "goodLogin" ) { 
            assert.ok( true ); //Just make sure it was called.
        } else {
            var siteList = rValue.siteList;
            assert.equal( rValue.type, "siteList");
            assert.equal(siteList[data.siteName].siteName, data.siteName );
            assert.equal(siteList[data.siteName].siteCounter, data.siteCounter );
            assert.equal(siteList[data.siteName].siteCounter, data.siteCounter );
        }
    });     
    
    
        
});


QUnit.test( "loadSiteListNonExistingUser", function( assert ) {    
    QUnit.expect(1);
    
    //Arrange    
    //db.dbEradicateUser( userName, password, privateKey );
    worker.db.dbGetSiteList = function ( uName, pword ) { return "badLogin"; };
    
    //Act	  
    worker.loadSiteList( data, function(rValue){        
        //Assert    	
        assert.equal( rValue.type, "badLogin");      
    });    
               
});


QUnit.test( "testComputeMainKey", function( assert ) {    
    QUnit.expect( 1 );
    
    //Arrange        
    worker.mpw.mpw_compute_secret_key = function(uName, mPassword, pProgress ) {
        if ( uName === data.userName && mPassword === data.masterPassword ) {
            return data.masterKey;
        }
    };    
    
    //Act	  
    worker.computeMainKey( data, null, function(rValue) {
        //Assert    	
        assert.equal( rValue.type, "masterKey" );                
    });            
    
    
        
});

QUnit.test( "testComputeSitePassword", function( assert ) {    
    QUnit.expect(2);
    
    //Arrange            
   
    //Act	  
    worker.computeSitePassword( data, function(rValue) {
        //Assert    	
        assert.equal( rValue.type, "sitePassword" );    
        assert.equal( rValue.data, "Gink2^LalqZuza" );    
    });
    
    
        
});

QUnit.test( "testCreateUser", function( assert ) {    
    QUnit.expect(2);
    
    //Arrange        
    //Mock the database connection
    worker.db.dbCreateUser = function dbCreateUser( userName, password, email, userCreationKey, capcha_response, capcha_challenge, fun )
    {
        return userName + password + email + userCreationKey + capcha_response + capcha_challenge + fun;
    };   
    
    var userCreationKey = getUserCreationKey();
    
    //Act	  
    worker.createUser( data, function(rValue) {
        //Assert    	
        assert.equal( rValue.type, "userSubmitted" );    
        assert.equal( rValue.data, data.userName + data.dbPassword + data.email + userCreationKey + data.capchaResponse + data.capchaChallenge + false );    
    }, userCreationKey );                
});

QUnit.test( "testCreateDuplicateUser", function( assert ) {    
    QUnit.expect(2);    
    
    //Arrange        
    //Mock the database connection that returns duplicate user.
    worker.db.dbCreateUser = function dbCreateUser( userName, password, email, antiSpamKey, fun )
    {        
        return "DUPLICATE_USER";
    };
    
    //Act	  
    worker.createUser( data, function(rValue) {
        //Assert    	
        assert.equal( rValue.type, "userSubmitted" );            
        assert.equal( rValue.data, "DUPLICATE_USER" );            
    });                
});


QUnit.test("testSaveSite", function( assert ) {    
    QUnit.expect(2);
        
    //Arrange
    var site = { "siteName": data.siteName, "siteCounter": data.siteCounter, "siteType": data.siteType };
    
    worker.db.dbSaveSite = function ( uName, dbPass, key, value )    
    {
        if ( uName === data.userName && dbPass === data.dbPassword && key === data.siteName && value === JSON.stringify(site) ) {
            return "OK";
        } else {            
            throw new Error("Error: ");
        }
    };
    
    //Act
    worker.saveSite( data, function(rValue) {
        //Assert    
        assert.equal( rValue.type, "siteSaved" );    
        assert.deepEqual( rValue.data, site );    
    });            
});

QUnit.test("testDeleteSite", function( assert ) {    
    QUnit.expect(2);
    
    //Arrange
    worker.db.dbDeleteSite = function ( uName, dbPass, sName )
    {
        if ( uName === data.userName && dbPass === data.dbPassword && sName === data.siteName  ) {
            return "OK";
        } else {            
            throw new Error("Error: ");
        }
    };
    
    //Act
    worker.deleteSite( data, function(rValue) {
        //Assert    
        assert.equal( rValue.type, "siteDeleted" );    
        assert.equal( rValue.data, data.siteName );    
    });
    
    
    
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
