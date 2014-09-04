//TODO: Add validator to check that inputs are reasonable

//Get a list of all elements tagged with class "input".
inputList = document.getElementsByClassName("input");
//console.log( inputList );

//Add an eventhandler to all of these elements.
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", clearAllOutput);
}

//Add an event handler to the button.

function clearAllOutput()
{
	var outputList = document.getElementsByClassName("output");
	//console.log( "Outputs: ");
	//console.log( outputList );
	for ( var i = 0; i < outputList.length; i++ ) {
		outputList[i].value = "";
	}
}

var computeBtn = document.getElementById("compute");
computeBtn.addEventListener("click", startWorker );

var w = new Worker("../js/mpw_worker.js");
w.addEventListener( "message", function(event) {
    console.log( event );
    document.getElementById("sitePassword").value = event.data;
    
    var img = document.getElementById("progress");
    img.src = "blank.gif";
    
    unlockUI();
    
}, false);

function startWorker() {
    if(typeof(Worker) !== "undefined") {    	    	
        lockUI();
        var util = new Util();
        
        //Build a message from the form to send
        var data = {};
        data.userName = document.getElementById('userName').value;
        data.masterPassword = document.getElementById('masterPassword').value;
        data.siteName = document.getElementById('siteName').value;
        data.siteCounter = document.getElementById('siteCounter').value;
        
        var jsonString = JSON.stringify(data);
        
        //Send a message to start the process.
        w.postMessage(jsonString);                      

        var img = document.getElementById("progress");
        img.src = "ajax-loader.gif";               
                
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