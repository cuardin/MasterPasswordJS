//TODO: Add validator to check that inputs are reasonable

//Get a list of all elements tagged with class "input".
inputList = document.getElementsByClassName("input");
//console.log( inputList );

//Add an eventhandler to all of these elements.
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", onInputChange);
}

var userName = null;
var masterPassword = null;

//Add an event handler to the button.
function onInputChange()
{
	var outputList = document.getElementsByClassName("output");
    if ( document.getElementById('userName').value == userName &&
        document.getElementById('masterPassword').value == masterPassword ) {
        
        //We only made a small change.        
        document.getElementById('compute').innerHTML = "Compute (<1s)";
    } else {
        //We made a big change.        
        document.getElementById('compute').innerHTML = "Compute (~10s)";
    }
    
	for ( var i = 0; i < outputList.length; i++ ) {
		outputList[i].value = "";
	}
}

var computeBtn = document.getElementById("compute");
computeBtn.addEventListener("click", startWorker );

var w = new Worker("../js/mpw_worker.js");
if(typeof(w) == "undefined") {    	    	
    document.getElementById("sitePassword").value = "Sorry, your browser does not support Web Workers...";
    lockUI();
} else {
    w.addEventListener( "message", workerEventHandler, false);
    w.addEventListener("error", workerEventHandler, false);
}

function workerEventHandler(event) {
    //console.log( event );    
    var data = event.data;
        
    //Add a delay to make sure we allways see an effect.
    setTimeout(function(event) {
        document.getElementById("sitePassword").value = data;
        var img = document.getElementById("progress");
        img.src = "blank.gif";
        document.getElementById('compute').innerHTML = "Compute (<1s)";
        document.getElementById("sitePassword").select(); //Select the password for copying

        unlockUI();    
    }, 100);
    
};

function startWorker() {
    if(typeof(Worker) !== "undefined") {    	    	
        lockUI();        
        onInputChange(); //Clear the output while we are computing.
        
        //Build a message from the form to send
        var data = {};
        data.userName = document.getElementById('userName').value;
        data.masterPassword = document.getElementById('masterPassword').value;
        data.siteName = document.getElementById('siteName').value;
        data.siteCounter = parseInt(document.getElementById('siteCounter').value);
        data.siteType = document.getElementById('siteType').value;
        data.command = "compute";
        
        var jsonString = JSON.stringify(data);
        
        //Send a message to start the process.
        w.postMessage(jsonString);                      

        var img = document.getElementById("progress");
        img.src = "ajax-loader.gif";               
        
        //Store the userName and password locally so we can check for change.
        masterPassword = data.masterPassword;
        userName = data.userName;
        document.getElementById('compute').innerHTML = "Computing";
                
    } else {
        document.getElementById("result").value = "Sorry, your browser does not support Web Workers...";
    }
}

function lockUI()
{   
    var computeBtn = document.getElementById("compute");    
    computeBtn.disabled = true;      
    
    var inputList = document.getElementsByClassName("input");
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].disabled = true;
    }
}

function unlockUI()
{    
    var computeBtn = document.getElementById("compute");    
    computeBtn.disabled = false;      
    
    var inputList = document.getElementsByClassName("input");
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].disabled = false;
    }
}