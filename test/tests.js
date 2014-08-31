QUnit.test( "testGenerateMainSalt", function( assert ) {
	//Arrange
	var mpNameSpace = "com.lyndir.masterpassword";
	var userName = "user01åäö";
	var mpw = new MPW();
    var util = new Util();

	//Act
	var masterKeySalt = mpw.mpw_core_calculate_master_key_salt(mpNameSpace, userName)
  	
  	//Assert
  	var stringSalt = util.convertBufferToHex(masterKeySalt);
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6" );
  	assert.equal( 12, new TextEncoder("utf-8").encode(userName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
    assert.equal( 41, masterKeySalt.length );

});

QUnit.test( "testGenerateSecretKey", function( assert ) {
	//Arrange
    var mpw = new MPW();
    var util = new Util();
    var masterPassword = "MasterPass01"   
	var masterKeySalt =  util.convertBufferFromHex("636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6");
    	
	//Act
	var masterKey = mpw.mpw_core_calculate_master_key(masterPassword, masterKeySalt);
  	
  	//Assert
  	var stringKey = util.convertBufferToHex(masterKey);
  	assert.equal( stringKey, "9124510a3ff74e95b5447686f717c52bd5f6b39676054472bf8ba83a72cd6972b790629de544d94d1e5f105d8c74a24910d944099cf4204dab16ac0feabb17b0" );
    assert.equal( masterKey.length, 64 );
});

QUnit.test( "testPassGenerateSiteSeed", function( assert ) {
	//Arrange
	var siteName = "site01.åäö";
    var siteCounter = 1;
    var mpNameSpace = "com.lyndir.masterpassword";
	var mpw = new MPW();
    var util = new Util();

	//Act
	var siteSeed = mpw.mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter );
  	
  	//Assert
  	var stringSalt = util.convertBufferToHex(siteSeed);  	
  	assert.equal( 13, new TextEncoder("utf-8").encode(siteName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
  	assert.equal( 46, siteSeed.length );
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000d7369746530312ec3a5c3a4c3b600000001" );
});

QUnit.test( "testPassHashSecretKey", function( assert ) {
	//Arrange
  var util = new Util();
  var mpw = new MPW();
	var masterKey = util.convertBufferFromHex("9124510a3ff74e95b5447686f717c52bd5f6b39676054472bf8ba83a72cd6972b790629de544d94d1e5f105d8c74a24910d944099cf4204dab16ac0feabb17b0");
  var siteSeed = util.convertBufferFromHex("636f6d2e6c796e6469722e6d617374657270617373776f72640000000d7369746530312ec3a5c3a4c3b600000001");
    	
	//Act
	var siteKey = mpw.mpw_core_compute_hmac(masterKey,siteSeed)
  	
  //Assert
  var stringKey = util.convertBufferToHex(siteKey);
  assert.equal( stringKey, "21d6d4b2466641c519c5f3e6903e0557ef6d7efd46a5dddbbe9d0e7d13be9c2a" );  	    

});

QUnit.test( "testPassConvertToPassword", function( assert ) {
	//Arrange
	var util = new Util();
    var mpw = new MPW();
    var sitePasswordSeed = util.convertBufferFromHex("21d6d4b2466641c519c5f3e6903e0557ef6d7efd46a5dddbbe9d0e7d13be9c2a");
    var siteTypeString = "long";	
	
	//Act
	var password = mpw.mpw_core_convert_to_password(siteTypeString, sitePasswordSeed );  	
  	  	
  	//Assert
  	assert.equal( password, "Gink2^LalqZuza" );
});

QUnit.test( "testComplete01", function( assert ) {
  //Arrange
  var util = new Util();
  var mpw = new MPW();
  //var masterKey = util.convertBufferFromHex("9124510a3ff74e95b5447686f717c52bd5f6b39676054472bf8ba83a72cd6972b790629de544d94d1e5f105d8c74a24910d944099cf4204dab16ac0feabb17b0");
  //var siteSeed = util.convertBufferFromHex("636f6d2e6c796e6469722e6d617374657270617373776f72640000000d7369746530312ec3a5c3a4c3b600000001");
  var userName = "user01åäö";
  var mpNameSpace = "com.lyndir.masterpassword";  
  //var masterKeySalt =  util.convertBufferFromHex("636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6");
  var masterPassword = "MasterPass01"   
  var siteName = "site01.åäö";
  var siteTypeString = "long";  
  var siteCounter = 1;  
  var masterKeySalt = mpw.mpw_core_calculate_master_key_salt(mpNameSpace, userName);
  var masterKey = mpw.mpw_core_calculate_master_key(masterPassword, masterKeySalt);
  var siteSeed = mpw.mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter );

      
  //Act
  var siteKey = mpw.mpw_core_compute_hmac(masterKey,siteSeed)
    
  //Assert
  var stringKey = util.convertBufferToHex(siteKey);
  assert.equal( stringKey, "21d6d4b2466641c519c5f3e6903e0557ef6d7efd46a5dddbbe9d0e7d13be9c2a" );        

  var password = mpw.mpw_core_convert_to_password(siteTypeString, siteKey );   
        
  //Assert
  assert.equal( password, "Gink2^LalqZuza" );

});

QUnit.test( "testCompleteLhunath", function( assert ) {
	//Arrange
	var userName = "Robert Lee Mitchel";
    var masterPassword = "banana colored duckling";
    var siteTypeString = "long";
    var siteName = "masterpasswordapp.com";    
    var siteCounter = 1;
	var mpw = new MPW();

	//Act
	var password = mpw.mpw_core ( userName, masterPassword, siteTypeString, siteName, siteCounter );  	
  	  	
  	//Assert
  	assert.equal( password, "Dora6.NudiDuhj" );
});
