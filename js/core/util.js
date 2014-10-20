function Util()
{
    this.convertBufferToHex = function (buffer) 
    {
        var h = '';
        for (var i = 0; i < buffer.length; i++) {
            h += ("00" + buffer[i].toString(16)).substr(-2);
        }
        return h;
    }       
    
    this.charToInt = function(char) {
    	switch( char ) {
            case '0':
                return 0;
            case '1':
                return 1;
            case '2':
                return 2;
            case '3':
                return 3;
            case '4':
                return 4;
            case '5':
                return 5;
            case '6':
                return 6;
            case '7':
                return 7;
            case '8':
                return 8;
            case '9':
                return 9;
            case 'a':
                return 10;
            case 'b':
                return 11;
            case 'c':
                return 12;
            case 'd':
                return 13;
            case 'e':
                return 14;
            case 'f':
                return 15;
        }        
        return -100000;        
    }
    
    this.convertBufferFromHex = function (string) 
    {
        //TODO: Figure out and make a test on why this does not work with Uint8Array.
        var h = new Array(string.length/2);
        for (var i = 0; i < h.length; i++) {
            var v1 = this.charToInt(string[2*i]);
            var v2 = this.charToInt(string[2*i+1]);
            h[i] = v1*16 + v2;
        }
        return new Uint8Array(h);
    }       

}
