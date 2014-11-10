QUnit.module( "module", undefined );

QUnit.test( "testDoHash", function( assert ) {
    
    //Arrange
    var util = new Util();    
    var key = util.convertBufferFromHex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
    var data = util.convertBufferFromHex("4869205468657265");            
    
    //Act
    var res = sha256Hash( key, data );

    //Assert
    assert.equal( util.convertBufferToHex(res), "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7" );
    
} );

QUnit.test( "testDoScrypt", function( assert ) {
    
    //Arrange
    var util = new Util();    
    
    var masterPassword = "MasterPass01"   
    var masterKeySalt =  util.convertBufferFromHex("636f6d2e6c796e6469722e6d617374657270617373776f72640000000c757365723031c3a5c3a4c3b6");            
    
    //Act
    var res = scrypt_crypt ( masterPassword, masterKeySalt )
    
    //Assert
    assert.equal( util.convertBufferToHex(res), "9124510a3ff74e95b5447686f717c52bd5f6b39676054472bf8ba83a72cd6972b790629de544d94d1e5f105d8c74a24910d944099cf4204dab16ac0feabb17b0" );    

});
