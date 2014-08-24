function convertBufferToHex(buffer) {
    var h = '';
    for (var i = 0; i < buffer.length; i++) {
        h += ("00" + buffer[i].toString(16)).substr(-2);
    }
    return h;
}

function mpw_core_calculate_master_key_salt( mpNameSpace, userName )
{	
	//Convert strings to byte buffers
    var mpNameSpaceRaw = TextEncoder("utf-8").encode(mpNameSpace);
	var userNameRaw = TextEncoder("utf-8").encode(userName);
    	
    //Allocate memory
    var salt     = new Uint8Array(mpNameSpaceRaw.length + 4/*sizeof(uint32)*/ + userNameRaw.length);
    var saltView = new DataView(salt.buffer);
    
    //Fill the buffer with the data.
    var i = 0;
    salt.set(mpNameSpaceRaw, i); i += mpNameSpaceRaw.length;
    saltView.setUint32(i, userNameRaw.length, false/*big-endian*/); i += 4/*sizeof(uint32)*/;
    salt.set(userNameRaw, i); i += name.length;
    return salt;
}