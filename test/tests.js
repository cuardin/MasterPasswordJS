
QUnit.test( "testConvertToHex", function( assert ) {
	var rawBytes = [3, 156, 54];	
	var bytes = new Uint8Array(rawBytes);		
	var hexString = convertBufferToHex( bytes );
	assert.equal( "039c36", hexString );
});

QUnit.test( "testMainSalt", function( assert ) {
	var mpNameSpace = "com.lyndir.masterpassword";
	var userName = "user01åäö";
	var masterKeySalt = mpw_core_calculate_master_key_salt(mpNameSpace, userName)
  	var stringSalt = convertBufferToHex(masterKeySalt);
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6" );
  	assert.equal( 12, TextEncoder("utf-8").encode(userName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
    assert.equal( 41, masterKeySalt.length );

});

QUnit.test( "testSiteSalt", function( assert ) {
	var siteName = "site01.åäö";
    var siteCounter = 3;
    var mpNameSpace = "com.lyndir.masterpassword";

	var siteSeed = mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter );
  	var stringSalt = convertBufferToHex(siteSeed);
  	
  	assert.equal( 13, TextEncoder("utf-8").encode(siteName).length ); //Ensure utf8 encoding(So last 3 are 2-byte);
  	assert.equal( 46, siteSeed.length );
  	assert.equal( stringSalt, "636f6d2e6c796e6469722e6d617374657270617373776f72640000000d7369746530312ec3a5c3a4c3b600000003" );
});
