//Get a list of all elements tagged with class "input".
inputList = document.getElementsByClassName("input");
//console.log( inputList );

//Add an eventhandler to all of these elements.
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", clearAllOutput);
}

//Add an event handler to the button.
var computeBtn = document.getElementById("compute");
computeBtn.addEventListener("click", startWorker );

function doTheThing()
{
	var output = document.getElementById("sitePassword");
	output.value="The thing!!!";
}

function clearAllOutput()
{
	var outputList = document.getElementsByClassName("output");
	//console.log( "Outputs: ");
	//console.log( outputList );
	for ( var i = 0; i < outputList.length; i++ ) {
		outputList[i].value = "";
	}
}

var w;

function startWorker() {
    if(typeof(Worker) !== "undefined") {    	
    	var computeBtn = document.getElementById("compute");
    	computeBtn.disabled = true;

        if(typeof(w) != "undefined") {
            w.terminate();                      
        }
        w = new Worker("../js/mpw_worker.js");
        w.onmessage = function(event) {
            console.log( event );
            document.getElementById("sitePassword").value = event.data;
        };

        //Change the event handler of the button to stop.
        
        computeBtn.innerHTML = "Stop";
        computeBtn.removeEventListener("click", startWorker);        
        computeBtn.addEventListener("click", stopWorker);        

        var img = document.getElementById("progress");
        img.src = "ajax-loader.gif";
        computeBtn.disabled = false;

    } else {
        document.getElementById("result").value = "Sorry, your browser does not support Web Workers...";
    }
}

function stopWorker() { 
	var computeBtn = document.getElementById("compute");
	computeBtn.disabled = true;
    w.terminate();    
	var img = document.getElementById("progress");
    img.src = "blank.gif";

    computeBtn.removeEventListener("click",stopWorker);
    computeBtn.addEventListener("click",startWorker);    
    computeBtn.innerHTML = "Compute";
    computeBtn.disabled = false;
}