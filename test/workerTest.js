//TODO: Make all tests pass with mocked call to getGlobalSiteSeed();
//TODO: Set the database object to an empty object to make sure all database calls are mocked.

var data = {};


var worker = {};

QUnit.module( "module", {
    setup: function( assert ) {
        //And make sure we have a worker object
        worker = new MPWWorker();        
        worker.db = {}; //We want to remove db completely.
        
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
        
    }, 
    teardown: function( assert ) {
        //And make sure we clean up our worker
        worker = {};
    }
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
