QUnit.module( "module", undefined );

QUnit.test( "testConvertToHexFromUint8Array", function( assert ) {
	//Arrange
	var rawBytes = [3, 156, 54];	
	var bytes = new Uint8Array(rawBytes);		
	var util = new Util();

	//Act
	var hexString = util.convertBufferToHex( bytes );

	//Assert
	assert.equal( "039c36", hexString );
});

QUnit.test( "testConvertToHexFromArray", function( assert ) {
	//Arrange	
	var bytes = new Array(3);
	bytes[0] = 3;
	bytes[1] = 156;
	bytes[2] = 54;		
	var util = new Util();

	//Act
	var hexString = util.convertBufferToHex( bytes );

	//Assert
	assert.equal( "039c36", hexString );
});

QUnit.test( "testConvertFromHex", function( assert ) {
	//Arrange
	var hexString = "039c36";    	
	var util = new Util();

	//Act
	var buffer = util.convertBufferFromHex( hexString );

	//Assert
    var rawBytes = [3, 156, 54];	 
	assert.equal( rawBytes[0], buffer[0] );
    assert.equal( rawBytes[1], buffer[1] );
    assert.equal( rawBytes[2], buffer[2] );
    
});
