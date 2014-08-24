var templates = {
    maximum: [
    "anoxxxxxxxxxxxxxxxxx",
    "axxxxxxxxxxxxxxxxxno"
    ],
    long: [
    "CvcvnoCvcvCvcv",
    "CvcvCvcvnoCvcv",
    "CvcvCvcvCvcvno",
    "CvccnoCvcvCvcv",
    "CvccCvcvnoCvcv",
    "CvccCvcvCvcvno",
    "CvcvnoCvccCvcv",
    "CvcvCvccnoCvcv",
    "CvcvCvccCvcvno",
    "CvcvnoCvcvCvcc",
    "CvcvCvcvnoCvcc",
    "CvcvCvcvCvccno",
    "CvccnoCvccCvcv",
    "CvccCvccnoCvcv",
    "CvccCvccCvcvno",
    "CvcvnoCvccCvcc",
    "CvcvCvccnoCvcc",
    "CvcvCvccCvccno",
    "CvccnoCvcvCvcc",
    "CvccCvcvnoCvcc",
    "CvccCvcvCvccno"
    ],
    medium: [
    "CvcnoCvc",
    "CvcCvcno"
    ],
    short: [
    "Cvcn"
    ],
    basic: [
    "aaanaaan",
    "aannaaan",
    "aaannaaa"
    ],
    pin: [
    "nnnn"
    ]
};

var passchars = {
    V: "AEIOU",
    C: "BCDFGHJKLMNPQRSTVWXYZ",
    v: "aeiou",
    c: "bcdfghjklmnpqrstvwxyz",
    A: "AEIOUBCDFGHJKLMNPQRSTVWXYZ",
    a: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz",
    n: "0123456789",
    o: "@&%?,=[]_:-+*$#!'^~;()/.",
    x: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789@&%?,=[]_:-+*$#!'^~;()/."
};

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

function mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter )
{
    //Convert strings to byte buffers
    var mpNameSpaceRaw = TextEncoder("utf-8").encode(mpNameSpace);
    var siteNameRaw = TextEncoder("utf-8").encode(siteName);

    var data     = new Uint8Array(mpNameSpaceRaw.length + 4/*sizeof(uint32)*/ + siteNameRaw.length + 4/*sizeof(uint32)*/);
    var dataView = new DataView(data.buffer);
    var i = 0;

    data.set(mpNameSpaceRaw, i); i += mpNameSpaceRaw.length;
    dataView.setUint32(i, siteNameRaw.length, false/*big-endian*/); i += 4/*sizeof(uint32)*/;
    data.set(siteNameRaw, i); i += siteNameRaw.length;
    dataView.setUint32(i, siteCounter, false/*big-endian*/); i += 4/*sizeof(uint32)*/;  

    return data;
}

function mpw_core_convert_to_password(siteTypeString, sitePasswordSeed )
{    
    template = templates[siteTypeString];
    template = template[sitePasswordSeed[0] % template.length];

    return template.split("").map(function (c, i) {
        var chars = passchars[c];
        return chars[sitePasswordSeed[i + 1] % chars.length];
    }).join("");

}

