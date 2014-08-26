
QUnit.test( "testConvertToHex", function( assert ) {
	//Arrange
	var rawBytes = [3, 156, 54];	
	var bytes = new Uint8Array(rawBytes);		
	var mpw = new MPW();

	//Act
	var hexString = mpw.convertBufferToHex( bytes );

	//Assert
	assert.equal( "039c36", hexString );
});

QUnit.test( "testMainSalt", function( assert ) {
	//Arrange
	var mpNameSpace = "com.lyndir.masterpassword";
	var userName = "user01åäö";
	var mpw = new MPW();

	//Act
	var masterKeySalt = mpw.mpw_core_calculate_master_key_salt(mpNameSpace, userName)
  	
  	//Assert
  	var stringSalt = mpw.convertBufferToHex(masterKeySalt);
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6" );
  	assert.equal( 12, new TextEncoder("utf-8").encode(userName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
    assert.equal( 41, masterKeySalt.length );

});

QUnit.test( "testSiteSalt", function( assert ) {
	//Arrange
	var siteName = "site01.åäö";
    var siteCounter = 3;
    var mpNameSpace = "com.lyndir.masterpassword";
	var mpw = new MPW();

	//Act
	var siteSeed = mpw.mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter );
  	
  	//Assert
  	var stringSalt = mpw.convertBufferToHex(siteSeed);  	
  	assert.equal( 13, new TextEncoder("utf-8").encode(siteName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
  	assert.equal( 46, siteSeed.length );
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000d7369746530312ec3a5c3a4c3b600000003" );
});

QUnit.test( "testPasswordGeneration", function( assert ) {
	//Arrange
	var sitePasswordSeed = new TextEncoder("utf-8").encode("C4157B94088A1A54DEE0516F7505A3A");
    var siteTypeString = "long";	
	var mpw = new MPW();

	//Act
	var password = mpw.mpw_core_convert_to_password(siteTypeString, sitePasswordSeed );  	
  	  	
  	//Assert
  	assert.equal( password, "NuprFino6_Dudo" );
});
