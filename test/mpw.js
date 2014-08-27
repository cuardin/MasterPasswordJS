//TODO: Adjust all functions to handle both string and buffer input.
function MPW()
{
    this.convertBufferToHex = function (buffer) 
    {
        var h = '';
        for (var i = 0; i < buffer.length; i++) {
            h += ("00" + buffer[i].toString(16)).substr(-2);
        }
        return h;
    }       

    this.mpw_core = function ( userName, masterPassword, siteTypeString, siteName, siteCounter )
    {
        var mpNameSpace = "com.lyndir.masterpassword";
        return ""
    }
    
    this.mpw_core_calculate_master_key_salt = function ( mpNameSpace, userName ) 
    {	
        //Convert strings to byte buffers
        var encoder = new TextEncoder("utf-8");
        var mpNameSpaceRaw = encoder.encode(mpNameSpace);
        var userNameRaw = encoder.encode(userName);

        //Allocate memory
        var salt     = new Uint8Array(mpNameSpaceRaw.length + 4/*sizeof(uint32)*/ + userNameRaw.length);
        var saltView = new DataView(salt.buffer);

        //Fill the buffer with the data.
        var i = 0;
        salt.set(mpNameSpaceRaw, i); i += mpNameSpaceRaw.length;
        saltView.setUint32(i, userNameRaw.length, false/*big-endian*/); i += 4/*sizeof(uint32)*/;
        salt.set(userNameRaw, i); i += userNameRaw.length;
        return salt;
    }
    
    this.mpw_core_calculate_secret_key = function( masterPassword, masterKeySalt ) 
    {
        var N = 32768;
        var r = 8;
        var p = 2;
        var dkLen = 64;
        
        var secretKey = scrypt( masterPassword, masterKeySalt, N, r,     p, dkLen) 
        
        return secretKey;        
    }

    this.mpw_core_calculate_site_seed = function ( mpNameSpace, siteName, siteCounter )
    {
        //Convert strings to byte buffers
        var encoder = new TextEncoder("utf-8");
        var mpNameSpaceRaw = encoder.encode(mpNameSpace);
        var siteNameRaw = encoder.encode(siteName);

        var data     = new Uint8Array(mpNameSpaceRaw.length + 4/*sizeof(uint32)*/ + siteNameRaw.length + 4/*sizeof(uint32)*/);
        var dataView = new DataView(data.buffer);
        var i = 0;

        data.set(mpNameSpaceRaw, i); i += mpNameSpaceRaw.length;
        dataView.setUint32(i, siteNameRaw.length, false/*big-endian*/); i += 4/*sizeof(uint32)*/;
        data.set(siteNameRaw, i); i += siteNameRaw.length;
        dataView.setUint32(i, siteCounter, false/*big-endian*/); i += 4/*sizeof(uint32)*/;  

        return data;
    }

    this.mpw_core_hash_site_info = function (secretKey, siteSeed ) 
    {
        if ( secretKey.length != 64 ) {
            return "Error"; //TODO: Change to proper error.
        }
        return HMAC_SHA256_MAC(secretKey, siteSeed);  //THis HMAC assumes MP_dkLen is 64.    
    }
    
    this.mpw_core_convert_to_password = function (siteTypeString, sitePasswordSeed )
    {    
        var template = this.templates[siteTypeString];
        template = template[sitePasswordSeed[0] % template.length];
        var passchars = this.passchars;

        return template.split("").map(function (c, i) {
            var chars = passchars[c];
            return chars[sitePasswordSeed[i + 1] % chars.length];
        }).join("");

    }

    this.templates = {
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

    this.passchars = {
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
}
