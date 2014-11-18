//TODO: Adjust all functions to handle both string and buffer input.
function MPW()
{
    //Stepwise computations.
    this.mpNameSpace = "com.lyndir.masterpassword";                    
    
    this.mpw_compute_secret_key = function( userName, masterPassword, progressFun )
    {       
        //var util = new Util();        
        
        var masterKeySalt = this.mpw_core_calculate_master_key_salt( userName );
        //console.log( "Master key salt: " + util.convertBufferToHex(masterKeySalt) );
        
        var masterKey = this.mpw_core_calculate_master_key( masterPassword, masterKeySalt, progressFun );                        
        //console.log( "Master key: " + util.convertBufferToHex(masterKey) );
        
        return masterKey;
    };
    
    this.mpw_compute_site_password = function( masterKey, siteTypeString, siteName, siteCounter)
    {
        var siteSeed = this.mpw_core_calculate_site_seed( siteName, siteCounter );                
        var passwordSeed = this.mpw_core_compute_hmac( masterKey, siteSeed );                
        var password = this.mpw_core_convert_to_password( siteTypeString, passwordSeed );        
        return password;
    };
            
    this.mpw_core = function ( userName, masterPassword, siteTypeString, siteName, siteCounter, progressFun )
    {        
        var util = new Util();
        
        var masterKeySalt = this.mpw_core_calculate_master_key_salt(  userName );        
        
        var masterKey = this.mpw_core_calculate_master_key( masterPassword, masterKeySalt, progressFun );                
        
        //Hack that I need for some reason. No idea why.....
        //masterKey = util.convertBufferFromHex(util.convertBufferToHex(masterKey));          

        var siteSeed = this.mpw_core_calculate_site_seed( siteName, siteCounter );                        
        
        var passwordSeed = this.mpw_core_compute_hmac( masterKey, siteSeed );                        

        var password = this.mpw_core_convert_to_password( siteTypeString, passwordSeed );        
        
        return password;
    };
    
    this.mpw_core_calculate_master_key_salt = function ( userName ) 
    {	
        if ( typeof(userName) !== "string" ) {
            throw new Error("Bad input data (mpw_core_calculate_master_key_salt): userName: " + typeof(userName) );
        }
        
        //Convert strings to byte buffers
        var encoder = new TextEncoder("utf-8");
        var mpNameSpaceRaw = encoder.encode(this.mpNameSpace);
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
    };
    
    this.mpw_core_calculate_master_key = function( masterPassword, masterKeySalt, progressFun ) 
    {                
        if ( !(masterKeySalt instanceof Uint8Array) || typeof(masterPassword) !== "string" ) {
            throw new Error("Bad input data (mpw_core_calculate_master_key): " + typeof(masterKeySalt) + " masterPassword: " + typeof(masterPassword) );
        }
        
        var secretKey = scrypt_crypt(masterPassword, masterKeySalt, progressFun );            
        
        return secretKey;                
    };

    this.mpw_core_calculate_site_seed = function ( siteName, siteCounter )
    {
        if ( typeof(siteName) !== "string" || typeof(siteCounter) !== "number" ) {
            throw new Error("Bad input data (mpw_core_calculate_site_seed): " + typeof(siteName) + " " + typeof(siteCounter) );
        }
        
        //Convert strings to byte buffers
        var encoder = new TextEncoder("utf-8");
        var mpNameSpaceRaw = encoder.encode(this.mpNameSpace);
        var siteNameRaw = encoder.encode(siteName);

        var data     = new Uint8Array(mpNameSpaceRaw.length + 4/*sizeof(uint32)*/ + siteNameRaw.length + 4/*sizeof(uint32)*/);
        var dataView = new DataView(data.buffer);
        var i = 0;

        data.set(mpNameSpaceRaw, i); i += mpNameSpaceRaw.length;
        dataView.setUint32(i, siteNameRaw.length, false/*big-endian*/); i += 4/*sizeof(uint32)*/;
        data.set(siteNameRaw, i); i += siteNameRaw.length;
        dataView.setUint32(i, siteCounter, false/*big-endian*/); i += 4/*sizeof(uint32)*/;  

        return data;
    };

    this.mpw_core_compute_hmac = function (secretKey, siteSeed ) 
    {
        if ( !(secretKey instanceof Uint8Array) || !(siteSeed instanceof Uint8Array) ) {            
            throw new Error("Bad input data (mpw_core_compute_hmac): "  + typeof(secretKey) + "/" + (secretKey instanceof Uint8Array) + " " + (siteSeed instanceof Uint8Array)  );
        }
        
        if ( secretKey.length !== 64 ) {
            throw new Error( "Secret key must be 64 bytes long" );
        }
                
        var siteKey = sha256Hash ( secretKey, siteSeed );         
        return siteKey;
    };
    
    this.mpw_core_convert_to_password = function (siteTypeString, sitePasswordSeed )
    {    
        if ( typeof(siteTypeString) !== "string" || !(sitePasswordSeed instanceof Uint8Array) ) {
            throw new Error("Bad input data (mpw_core_convert_to_password): " + typeof(siteTypeString) + " " + (sitePasswordSeed instanceof Uint8Array) );
        }

        var template = this.templates[siteTypeString];
        template = template[sitePasswordSeed[0] % template.length];
        var passchars = this.passchars;

        return template.split("").map(function (c, i) {
            var chars = passchars[c];
            return chars[sitePasswordSeed[i + 1] % chars.length];
        }).join("");

    };

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
