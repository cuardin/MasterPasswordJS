//TODO: Adjust all functions to handle both string and buffer input.
function MPW()
{

    this.do_convert_uint8_to_array = function ( uint8_arr ) 
    {
        /*
        var rValue = new Array(uint8_arr.length);
        for ( var i = 0; i < uint8_arr.length; i++ ) {
            rValue[i] = uint8_arr[i];
        }
        return rValue;
        */
        return Array.apply([], uint8_arr);
    }
    
    this.mpw_core = function ( userName, masterPassword, siteTypeString, siteName, siteCounter )
    {
        var util = new Util();
        var mpNameSpace = "com.lyndir.masterpassword";
        var masterKeySalt = this.mpw_core_calculate_master_key_salt( mpNameSpace, userName )        
        var masterKey = this.mpw_core_calculate_master_key( masterPassword, masterKeySalt );                
        var siteSeed = this.mpw_core_calculate_site_seed( mpNameSpace, siteName, siteCounter );                
        var passwordSeed = this.mpw_core_compute_hmac( masterKey, siteSeed );                
        var password = this.mpw_core_convert_to_password( siteTypeString, passwordSeed );        
        return password;
    }
    
    this.mpw_core_calculate_master_key_salt = function ( mpNameSpace, userName ) 
    {	
        if ( typeof(mpNameSpace) != "string" || typeof(userName) != "string" ) {
            throw new Error("Bad input data");
        }
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
        return this.do_convert_uint8_to_array( salt );
    }
    
    this.mpw_core_calculate_master_key = function( masterPassword, masterKeySalt ) 
    {        
        if ( !(masterKeySalt instanceof Array) || typeof(masterPassword) != "string" ) {
            throw new Error("Bad input data" );
        }
        
        var N = 32768; /*32768;*/
        var r = 8;
        var p = 2;
        var dkLen = 64;
        
        var secretKey = scrypt( masterPassword, masterKeySalt, N, r,     p, dkLen) 
        
        return this.do_convert_uint8_to_array( secretKey );        
    }

    this.mpw_core_calculate_site_seed = function ( mpNameSpace, siteName, siteCounter )
    {
        if ( typeof(mpNameSpace) != "string" || typeof(siteName) != "string" || typeof(siteCounter) != "number" ) {
            throw new Error("Bad input data" );
        }
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

        return this.do_convert_uint8_to_array(data);
    }

    this.mpw_core_compute_hmac = function (secretKey, siteSeed ) 
    {
        if ( !(secretKey instanceof Array) || !(siteSeed instanceof Array) ) {
            throw new Error("Bad input data" );
        }

        if ( secretKey.length != 64 ) {
            return "Error"; //TODO: Change to proper error.
        }
        
        HMAC_SHA256_init(secretKey);
        HMAC_SHA256_write(siteSeed);
        var siteKey = HMAC_SHA256_finalize();         
        return this.do_convert_uint8_to_array( siteKey );
    }
    
    this.mpw_core_convert_to_password = function (siteTypeString, sitePasswordSeed )
    {    
        if ( typeof(siteTypeString) != "string" || !(sitePasswordSeed instanceof Array) ) {
            throw new Error("Bad input data" );
        }

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
