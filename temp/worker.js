    function eventHandler(event) {
        try {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET","https://192.168.56.101",false);
            xmlhttp.send();
            var rValue = xmlhttp.responseText;
            this.postMessage(event.data + " " + escape(rValue.substr(0,100)) );        
            
        } catch ( error ) {
            this.postMessage( event.data + " Error: " + error.message)
        }
    }
    
    this.addEventListener('message', eventHandler, false);