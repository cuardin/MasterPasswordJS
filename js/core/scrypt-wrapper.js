function arrayCopy( inputArray ) 
{
    var rValue = new Uint8Array(inputArray.length);
    for ( var i = 0; i < rValue.length; i++ ) {
        rValue[i] = inputArray[i];
    }
    return rValue;
}

function sha256Hash ( key, data ) 
{
    //Declare a function
    var hashFun = Module.cwrap('libcperciva_HMAC_SHA256_Buf','undefined',['number','number','number','number', 'number']);            
    
    //Copy to emscripten space
    var keyLength = key.length;
    var keyPtr = Module._malloc(keyLength);
    Module.writeArrayToMemory( key, keyPtr );
    
    var dataLength = data.length;
    var dataPtr = Module._malloc(dataLength);
    Module.writeArrayToMemory( data, dataPtr );
    
    var resPtr = Module._malloc(32);
    Module._memset(resPtr,0,32);

    //Do the thing
    hashFun( keyPtr, keyLength, dataPtr, dataLength, resPtr );
    
    //Extract the result
    var res = arrayCopy(new Uint8Array(Module.HEAPU8.buffer, resPtr, 32));    
    
    //Cleanup
    Module._free(keyPtr);
    Module._free(dataPtr);
    Module._free(resPtr);

    return res;
}


function scrypt_crypt ( masterPassword, masterKeySalt )
{
    var scryptFun = Module.cwrap('scrypt_wrapper','number',['number','number','number','number', 'number']);                
    
    var encoder = new TextEncoder("utf-8");
    var masterPasswordRaw = encoder.encode( masterPassword );  
        
      
    //Copy to emscripten space
    var masterPasswordLength = masterPasswordRaw.length;
    var masterPasswordPtr = Module._malloc(masterPasswordLength);
    Module.writeArrayToMemory( masterPasswordRaw, masterPasswordPtr );
    
    var masterKeySaltLength = masterKeySalt.length;
    var masterKeySaltPtr = Module._malloc(masterKeySaltLength);
    Module.writeArrayToMemory( masterKeySalt, masterKeySaltPtr );
    
    var resPtr = Module._malloc(64);
    Module._memset(resPtr,0,64);

    //Do the thing
    bOK = scryptFun( masterPasswordPtr, masterPasswordLength, 
        masterKeySaltPtr, masterKeySaltLength, resPtr );       
    
    //Pull out the result
    var res = arrayCopy(new Uint8Array(Module.HEAPU8.buffer, resPtr, 64));
    
    //Cleanup
    Module._free(masterPasswordPtr);
    Module._free(masterKeySaltPtr);
    Module._free(resPtr);

    return res;
}