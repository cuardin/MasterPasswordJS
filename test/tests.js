
QUnit.test( "testMainSalt", function( assert ) {
	var mpNameSpace = "com.lyndir.masterpassword";
	var userName = "user01åäö";
	var masterKeySalt = mpw_core_calculate_master_key_salt(mpNameSpace, userName)
  	var stringSalt = convertBufferToHex(masterKeySalt);
  	assert.equal( "636f6d2e6c796e6469722e6d617374657270617373776f7264000c757365723031c3a5c3a4c3b6",
		 stringSalt );
});

QUnit.test( "testConvertToHex", function( assert ) {
	var rawBytes = [3, 156, 54];	
	var bytes = new Uint8Array(rawBytes);		
	var hexString = convertBufferToHex( bytes );
	assert.equal( "039c36", hexString );
});