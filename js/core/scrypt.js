var MAX_VALUE = 2147483647;

function convertArrayToUint8Array( data ) 
{
    var rValue = new Uint8Array( data.length );
    for ( var i = 0; i < data.length; i++ ) {
        rValue[i] = data[i];
    }
    return rValue;
}

function sha256Hash ( key, data ) 
{
    key = Array.apply([], key );
    data = Array.apply([], data );
        
    HMAC_SHA256_init(key);
    HMAC_SHA256_write(data);
    var hash = HMAC_SHA256_finalize();
    
    hash = convertArrayToUint8Array( hash );
    return hash;
}

function scrypt_crypt ( masterPassword, masterKeySalt )
{
    var N = 32768;
    var r = 8;
    var p = 2;
    var dkLen = 64;
    return scrypt( masterPassword, masterKeySalt, N, r, p, dkLen, null );
}

//function scrypt(byte[] passwd, byte[] salt, int N, int r, int p, int dkLen)
/*
 * N = Cpu cost
 * r = Memory cost
 * p = parallelization cost
 *
 */
function scrypt(passwd, salt, N, r, p, dkLen, progressFun) {
    if (N == 0 || (N & (N - 1)) != 0) throw Error("N must be > 0 and a power of 2");
    if (N > MAX_VALUE / 128 / r) throw Error("Parameter N is too large");
    if (r > MAX_VALUE / 128 / p) throw Error("Parameter r is too large");
    var DK = []; //new Array(dkLen);
    var B = []; //new Array(128 * r * p);
    var XY = []; //new Array(256 * r);
    var V = []; //new Array(128 * r * N);
    var i;
    pbkdf2(passwd, new Uint8Array(salt), 1, B, p * 128 * r);
    for (i = 0; i < p; i++) {
        if (progressFun != undefined) {
            progressFun(i, p);
        }
        smix(B, i * 128 * r, r, N, V, XY);
    }
    pbkdf2(passwd, B, 1, DK, dkLen);
    return new Uint8Array(DK);
}

function smix(B, Bi, r, N, V, XY) {
    var Xi = 0;
    var Yi = 128 * r;
    var i;
    arraycopy(B, Bi, XY, Xi, Yi);
    for (i = 0; i < N; i++) {
        arraycopy(XY, Xi, V, i * Yi, Yi);
        blockmix_salsa8(XY, Xi, Yi, r);
    }
    for (i = 0; i < N; i++) {
        var j = integerify(XY, Xi, r) & (N - 1);
        blockxor(V, j * Yi, XY, Xi, Yi);
        blockmix_salsa8(XY, Xi, Yi, r);
    }
    arraycopy(XY, Xi, B, Bi, Yi);
}

function blockmix_salsa8(BY, Bi, Yi, r) {
    var X = [];
    var i;
    arraycopy32(BY, Bi + (2 * r - 1) * 64, X, 0, 64);
    for (i = 0; i < 2 * r; i++) {
        blockxor(BY, i * 64, X, 0, 64);
        salsa20_8(X);
        arraycopy32(X, 0, BY, Yi + (i * 64), 64);
    }
    for (i = 0; i < r; i++) {
        arraycopy32(BY, Yi + (i * 2) * 64, BY, Bi + (i * 64), 64);
    }
    for (i = 0; i < r; i++) {
        arraycopy32(BY, Yi + (i * 2 + 1) * 64, BY, Bi + (i + r) * 64, 64);
    }
}

function R(a, b) {
    return (a << b) | (a >>> (32 - b));
}

function salsa20_8(B) {
    var B32 = new Array(32);
    var x = new Array(32);
    var i;
    for (i = 0; i < 16; i++) {
        B32[i] = (B[i * 4 + 0] & 0xff) << 0;
        B32[i] |= (B[i * 4 + 1] & 0xff) << 8;
        B32[i] |= (B[i * 4 + 2] & 0xff) << 16;
        B32[i] |= (B[i * 4 + 3] & 0xff) << 24;
    }
    arraycopy(B32, 0, x, 0, 16);
    for (i = 8; i > 0; i -= 2) {
        x[4] ^= R(x[0] + x[12], 7);
        x[8] ^= R(x[4] + x[0], 9);
        x[12] ^= R(x[8] + x[4], 13);
        x[0] ^= R(x[12] + x[8], 18);
        x[9] ^= R(x[5] + x[1], 7);
        x[13] ^= R(x[9] + x[5], 9);
        x[1] ^= R(x[13] + x[9], 13);
        x[5] ^= R(x[1] + x[13], 18);
        x[14] ^= R(x[10] + x[6], 7);
        x[2] ^= R(x[14] + x[10], 9);
        x[6] ^= R(x[2] + x[14], 13);
        x[10] ^= R(x[6] + x[2], 18);
        x[3] ^= R(x[15] + x[11], 7);
        x[7] ^= R(x[3] + x[15], 9);
        x[11] ^= R(x[7] + x[3], 13);
        x[15] ^= R(x[11] + x[7], 18);
        x[1] ^= R(x[0] + x[3], 7);
        x[2] ^= R(x[1] + x[0], 9);
        x[3] ^= R(x[2] + x[1], 13);
        x[0] ^= R(x[3] + x[2], 18);
        x[6] ^= R(x[5] + x[4], 7);
        x[7] ^= R(x[6] + x[5], 9);
        x[4] ^= R(x[7] + x[6], 13);
        x[5] ^= R(x[4] + x[7], 18);
        x[11] ^= R(x[10] + x[9], 7);
        x[8] ^= R(x[11] + x[10], 9);
        x[9] ^= R(x[8] + x[11], 13);
        x[10] ^= R(x[9] + x[8], 18);
        x[12] ^= R(x[15] + x[14], 7);
        x[13] ^= R(x[12] + x[15], 9);
        x[14] ^= R(x[13] + x[12], 13);
        x[15] ^= R(x[14] + x[13], 18);
    }
    for (i = 0; i < 16; ++i) B32[i] = x[i] + B32[i];
    for (i = 0; i < 16; i++) {
        var bi = i * 4;
        B[bi + 0] = (B32[i] >> 0 & 0xff);
        B[bi + 1] = (B32[i] >> 8 & 0xff);
        B[bi + 2] = (B32[i] >> 16 & 0xff);
        B[bi + 3] = (B32[i] >> 24 & 0xff);
    }
}

function blockxor(S, Si, D, Di, len) {
    // for (var i = 0; i < len; i++) {
    // D[Di + i] ^= S[Si + i];
    // }
    var i = len >> 6;
    while (i--) {
        // D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        //32
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        D[Di++] ^= S[Si++];
        // 64
    }
}

function integerify(B, bi, r) {
    var n;
    bi += (2 * r - 1) * 64;
    n = (B[bi + 0] & 0xff) << 0;
    n |= (B[bi + 1] & 0xff) << 8;
    n |= (B[bi + 2] & 0xff) << 16;
    n |= (B[bi + 3] & 0xff) << 24;
    return n;
}

function arraycopy(src, srcPos, dest, destPos, length) {
    while (length--) {
        dest[destPos++] = src[srcPos++];
    }
}

function arraycopy16(src, srcPos, dest, destPos, length) {
    var i = length >> 4;
    while (i--) {
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
    }
}

function arraycopy32(src, srcPos, dest, destPos, length) {
    var i = length >> 5;
    while (i--) {
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        dest[destPos++] = src[srcPos++];
        // 32
    }
}

/**
 * Implementation of PBKDF2 (RFC2898).
 *
 * @param passwd
 * Secret key to initialise MAC function.
 * @param S
 * Salt.
 * @param c
 * Iteration count.
 * @param DK
 * Byte array that derived key will be placed in.
 * @param dkLen
 * Intended length, in octets, of the derived key.
 *
 * @throws Error
 */
function pbkdf2(passwd, S, c, DK, dkLen) {
    // fixed to 32
    var hLen = 32;
    if (dkLen > (Math.pow(2, 32) - 1) * hLen) {
        throw Error("Requested key length too long");
    }
    var U = [];
    var T = [];
    var block1 = [];
    var l = Math.ceil(dkLen / hLen);
    var r = dkLen - (l - 1) * hLen;
    arraycopy(S, 0, block1, 0, S.length);
    for (var i = 1; i <= l; i++) {
        block1[S.length + 0] = (i >> 24 & 0xff);
        block1[S.length + 1] = (i >> 16 & 0xff);
        block1[S.length + 2] = (i >> 8 & 0xff);
        block1[S.length + 3] = (i >> 0 & 0xff);
        HMAC_SHA256_init(passwd);
        HMAC_SHA256_write(block1);
        U = HMAC_SHA256_finalize();
        arraycopy(U, 0, T, 0, hLen);
        for (var j = 1; j < c; j++) {
            sha256.update(U);
            U = sha256.finalize();
            for (var k = 0; k < hLen; k++) {
                T[k] ^= U[k];
            }
        }
        arraycopy(T, 0, DK, (i - 1) * hLen, (i == l ? r : hLen));
    }
}

function arraycopy(src, srcPos, dest, destPos, length) {
    while (length--) {
        dest[destPos++] = src[srcPos++];
    }
}


/*
 * jssha256 version 0.1 - Copyright 2006 B. Poettering
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 * 02111-1307 USA
 */
/*
 * http://point-at-infinity.org/jssha256/
 *
 * This is a JavaScript implementation of the SHA256 secure hash function
 * and the HMAC-SHA256 message authentication code (MAC).
 *
 * The routines' well-functioning has been verified with the test vectors
 * given in FIPS-180-2, Appendix B and IETF RFC 4231. The HMAC algorithm
 * conforms to IETF RFC 2104.
 *
 * The following code example computes the hash value of the string "abc".
 *
 * SHA256_init();
 * SHA256_write("abc");
 * digest = SHA256_finalize();
 * digest_hex = array_to_hex_string(digest);
 *
 * Get the same result by calling the shortcut function SHA256_hash:
 *
 * digest_hex = SHA256_hash("abc");
 *
 * In the following example the calculation of the HMAC of the string "abc"
 * using the key "secret key" is shown:
 *
 * HMAC_SHA256_init("secret key");
 * HMAC_SHA256_write("abc");
 * mac = HMAC_SHA256_finalize();
 * mac_hex = array_to_hex_string(mac);
 *
 * Again, the same can be done more conveniently:
 *
 * mac_hex = HMAC_SHA256_MAC("secret key", "abc");
 *
 * Note that the internal state of the hash function is held in global
 * variables. Therefore one hash value calculation has to be completed
 * before the next is begun. The same applies the the HMAC routines.
 *
 * Report bugs to: jssha256 AT point-at-infinity.org
 *
 */
/******************************************************************************/
/* Two all purpose helper functions follow */
/* string_to_array: convert a string to a character (byte) array */
function string_to_array(str) {
        var len = str.length;
        var res = new Array(len);
        for (var i = 0; i < len; i++)
            res[i] = str.charCodeAt(i);
        return res;
    }
    /* array_to_hex_string: convert a byte array to a hexadecimal string */
function array_to_hex_string(ary) {
        var res = "";
        for (var i = 0; i < ary.length; i++)
            res += SHA256_hexchars[ary[i] >> 4] + SHA256_hexchars[ary[i] & 0x0f];
        return res;
    }
    /******************************************************************************/
    /* The following are the SHA256 routines */
    /*
    SHA256_init: initialize the internal state of the hash function. Call this
    function before calling the SHA256_write function.
    */
function SHA256_init() {
        SHA256_H = new Array(0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19);
        SHA256_buf = new Array();
        SHA256_len = 0;
    }
    /*
    SHA256_write: add a message fragment to the hash function's internal state.
    'msg' may be given as string or as byte array and may have arbitrary length.
    */
function SHA256_write(msg) {
        if (typeof(msg) == "string")
            SHA256_buf = SHA256_buf.concat(string_to_array(msg));
        else
            SHA256_buf = SHA256_buf.concat(msg);
        for (var i = 0; i + 64 <= SHA256_buf.length; i += 64)
            SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf.slice(i, i + 64));
        SHA256_buf = SHA256_buf.slice(i);
        SHA256_len += msg.length;
    }
    /*
    SHA256_finalize: finalize the hash value calculation. Call this function
    after the last call to SHA256_write. An array of 32 bytes (= 256 bits)
    is returned.
    */
function SHA256_finalize() {
        SHA256_buf[SHA256_buf.length] = 0x80;
        if (SHA256_buf.length > 64 - 8) {
            for (var i = SHA256_buf.length; i < 64; i++)
                SHA256_buf[i] = 0;
            SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);
            SHA256_buf.length = 0;
        }
        for (var i = SHA256_buf.length; i < 64 - 5; i++)
            SHA256_buf[i] = 0;
        SHA256_buf[59] = (SHA256_len >>> 29) & 0xff;
        SHA256_buf[60] = (SHA256_len >>> 21) & 0xff;
        SHA256_buf[61] = (SHA256_len >>> 13) & 0xff;
        SHA256_buf[62] = (SHA256_len >>> 5) & 0xff;
        SHA256_buf[63] = (SHA256_len << 3) & 0xff;
        SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);
        var res = new Array(32);
        for (var i = 0; i < 8; i++) {
            res[4 * i + 0] = SHA256_H[i] >>> 24;
            res[4 * i + 1] = (SHA256_H[i] >> 16) & 0xff;
            res[4 * i + 2] = (SHA256_H[i] >> 8) & 0xff;
            res[4 * i + 3] = SHA256_H[i] & 0xff;
        }
        delete SHA256_H;
        delete SHA256_buf;
        delete SHA256_len;
        return res;
    }
    /*
    SHA256_hash: calculate the hash value of the string or byte array 'msg'
    and return it as hexadecimal string. This shortcut function may be more
    convenient than calling SHA256_init, SHA256_write, SHA256_finalize
    and array_to_hex_string explicitly.
    */
function SHA256_hash(msg) {
        var res;
        SHA256_init();
        SHA256_write(msg);
        res = SHA256_finalize();
        return array_to_hex_string(res);
    }
    /******************************************************************************/
    /* The following are the HMAC-SHA256 routines */
    /*
    HMAC_SHA256_init: initialize the MAC's internal state. The MAC key 'key'
    may be given as string or as byte array and may have arbitrary length.
    */
function HMAC_SHA256_init(key) {
        if (typeof(key) == "string")
            HMAC_SHA256_key = string_to_array(key);
        else
            HMAC_SHA256_key = new Array().concat(key);
        if (HMAC_SHA256_key.length > 64) {
            SHA256_init();
            SHA256_write(HMAC_SHA256_key);
            HMAC_SHA256_key = SHA256_finalize();
        }
        for (var i = HMAC_SHA256_key.length; i < 64; i++)
            HMAC_SHA256_key[i] = 0;
        for (var i = 0; i < 64; i++)
            HMAC_SHA256_key[i] ^= 0x36;
        SHA256_init();
        SHA256_write(HMAC_SHA256_key);
    }
    /*
    HMAC_SHA256_write: process a message fragment. 'msg' may be given as
    string or as byte array and may have arbitrary length.
    */
function HMAC_SHA256_write(msg) {
        SHA256_write(msg);
    }
    /*
    HMAC_SHA256_finalize: finalize the HMAC calculation. An array of 32 bytes
    (= 256 bits) is returned.
    */
function HMAC_SHA256_finalize() {
        var md = SHA256_finalize();
        for (var i = 0; i < 64; i++)
            HMAC_SHA256_key[i] ^= 0x36 ^ 0x5c;
        SHA256_init();
        SHA256_write(HMAC_SHA256_key);
        SHA256_write(md);
        for (var i = 0; i < 64; i++)
            HMAC_SHA256_key[i] = 0;
        delete HMAC_SHA256_key;
        return SHA256_finalize();
    }
    /*
    HMAC_SHA256_MAC: calculate the HMAC value of message 'msg' under key 'key'
    (both may be of type string or byte array); return the MAC as hexadecimal
    string. This shortcut function may be more convenient than calling
    HMAC_SHA256_init, HMAC_SHA256_write, HMAC_SHA256_finalize and
    array_to_hex_string explicitly.
    */
function HMAC_SHA256_MAC(key, msg) {
        var res;
        HMAC_SHA256_init(key);
        HMAC_SHA256_write(msg);
        res = HMAC_SHA256_finalize();
        return array_to_hex_string(res);
    }
    /******************************************************************************/
    /* The following lookup tables and functions are for internal use only! */
SHA256_hexchars = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f');
SHA256_K = new Array(
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
);

function SHA256_sigma0(x) {
    return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
}

function SHA256_sigma1(x) {
    return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
}

function SHA256_Sigma0(x) {
    return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^
        ((x >>> 22) | (x << 10));
}

function SHA256_Sigma1(x) {
    return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^
        ((x >>> 25) | (x << 7));
}

function SHA256_Ch(x, y, z) {
    return z ^ (x & (y ^ z));
}

function SHA256_Maj(x, y, z) {
    return (x & y) ^ (z & (x ^ y));
}

function SHA256_Hash_Word_Block(H, W) {
    for (var i = 16; i < 64; i++)
        W[i] = (SHA256_sigma1(W[i - 2]) + W[i - 7] +
            SHA256_sigma0(W[i - 15]) + W[i - 16]) & 0xffffffff;
    var state = new Array().concat(H);
    for (var i = 0; i < 64; i++) {
        var T1 = state[7] + SHA256_Sigma1(state[4]) +
            SHA256_Ch(state[4], state[5], state[6]) + SHA256_K[i] + W[i];
        var T2 = SHA256_Sigma0(state[0]) + SHA256_Maj(state[0], state[1], state[2]);
        state.pop();
        state.unshift((T1 + T2) & 0xffffffff);
        state[4] = (state[4] + T1) & 0xffffffff;
    }
    for (var i = 0; i < 8; i++)
        H[i] = (H[i] + state[i]) & 0xffffffff;
}

function SHA256_Hash_Byte_Block(H, w) {
    var W = new Array(16);
    for (var i = 0; i < 16; i++)
        W[i] = w[4 * i + 0] << 24 | w[4 * i + 1] << 16 |
        w[4 * i + 2] << 8 | w[4 * i + 3];
    SHA256_Hash_Word_Block(H, W);
}