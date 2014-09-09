//Get a list of all elements tagged with class "siteInput".
inputList = document.getElementsByClassName("siteInput");
//Add an eventhandler to all of these elements.
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", startSiteWorker);
    inputList[i].addEventListener("change", startSiteWorker);
}

//Get a list of all elements tagged with class "mainInput".
inputList = document.getElementsByClassName("mainInput");
//Add an eventhandler to all of these elements.
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", onMainInputChange);
}

function onMainInputChange() {
    document.getElementById("sitePassword").value = "";
    enableComputeBtn();
    
    inputList = document.getElementsByClassName("siteInput");
    //Add an eventhandler to all of these elements.
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].disabled = true;
    }
}

//Add an event listener to check that number is properly entered.
document.getElementById("siteCounter").addEventListener( "input", onInputNumberChange );

function onInputNumberChange() {
    var siteCounter = document.getElementById("siteCounter")
    var value = parseInt(siteCounter.value);
    if ( isNaN(value) ) {
        siteCounter.style="box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -moz-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -webkit-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px;";
    } else {
        siteCounter.style="";
    }
}

var userName = null;
var masterPassword = null;

var computeBtn = document.getElementById("compute");
computeBtn.addEventListener("click", startMainWorker );

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
    var data = JSON.parse(event.data);
    //console.log( data );
        
    //Add a delay to make sure we allways see an effect.
    if ( data.type == "password" ) {           
        setTimeout(function(event) {
            document.getElementById("sitePassword").value = data.data;  
            document.getElementById("progress").src = "blank.gif";
            document.getElementById('compute').innerHTML = "Compute";
            //document.getElementById("sitePassword").select(); //Select the password for copying           
        }, 100);
    } else if ( data.type == "mainKey" ) {
        setTimeout(function(event) {            
            document.getElementById("progress").src = "blank.gif";
            document.getElementById('compute').innerHTML = "Compute";            
            unlockUI();   
            disableComputeBtn();
            startSiteWorker();
        }, 100);
        
    } else if ( data.type == "progress" ) {
        document.getElementById("compute").innerHTML = "Computing: " + data.data;
    } else {
       document.getElementById("sitePassword").value = data.data;  
    }
    
};
function startSiteWorker() {
    if(typeof(Worker) !== "undefined") {    	    	        
        
        //Build a message from the form to send
        var data = {};
        data.siteName = document.getElementById('siteName').value;
        data.siteCounter = parseInt(document.getElementById('siteCounter').value);
        if ( isNaN(data.siteCounter) ) {
            document.getElementById("sitePassword").value = "N/A";  
            return;
        }
            
        data.siteType = document.getElementById('siteType').value;
        data.command = "siteCompute";
        
        var jsonString = JSON.stringify(data);
        
        //Send a message to start the process.
        w.postMessage(jsonString);                      

        var img = document.getElementById("progress");
        img.src = "ajax-loader.gif";               
        
        //document.getElementById('compute').innerHTML = "Computing";
    }
}
function startMainWorker() {
    if(typeof(Worker) !== "undefined") {    	    	
        lockUI();        
        
        //Build a message from the form to send
        var data = {};
        data.userName = document.getElementById('userName').value;
        data.masterPassword = document.getElementById('masterPassword').value;
        data.command = "mainCompute";
        
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
    disableComputeBtn();
    
    var inputList = document.getElementsByClassName("siteInput");
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].disabled = true;
    }
}

function unlockUI()
{    
    enableComputeBtn();
    
    var inputList = document.getElementsByClassName("siteInput");
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].disabled = false;
    }
}

function enableComputeBtn()
{
    var computeBtn = document.getElementById("compute");    
    computeBtn.disabled = false;          
}

function disableComputeBtn()
{
    var computeBtn = document.getElementById("compute");    
    computeBtn.disabled = true;          
}
