self.addEventListener('message', handleMessage);
var userName = null;
var masterPassword = null;

function handleMessage(event) {
    setTimeout(function () {
        var data = JSON.parse(event.data);        
        if ( userName != data.userName || masterPassword != data.masterPassword ) {
            userName = data.userName;
            masterPassword = data.masterPassword;
            postMessage("Slow run");
        } else {
            postMessage("Quick run");
        }
    }, 1000 );            
}



