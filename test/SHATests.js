QUnit.test( "testHMACSHA256", function( assert ) {
	//Arrange
	var util = new Util();    
    var key = util.convertBufferFromHex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
    var data = util.convertBufferFromHex("4869205468657265");    
    
	//Act	  
    var res;
    HMAC_SHA256_init(key);
    HMAC_SHA256_write(data);
    res = HMAC_SHA256_finalize()

	//Assert    	
    assert.equal( util.convertBufferToHex(res), 
        "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7" );
        
});

