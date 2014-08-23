function convertBufferToHex(buffer) {
    var h = '';
    for (var i = 0; i < buffer.length; i++) {
        h += ("00" + buffer[i].toString(16)).substr(-2);
    }
    return h;
}

function mpw_core_calculate_master_key_salt( mpNameSpace, userName )
{
	//Read about conversion here.
	var mpNameSpaceRaw = TextEncoder("utf-8").encode(mpNameSpace);
	var userNameRaw = TextEncoder("utf-8").encode(userName);
	return mpNameSpaceRaw;
}