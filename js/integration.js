//TODO: Find out why autocomplete isn't working.

//Check if we should even be here.
if(!window.Worker) { 
    document.getElementById("mainDiv").innerHTML = "Sorry, your browser does not support Web Workers...";        
} 

//***************************************
// Declare all globals.
var userName = null;
var masterPassword = null;
var masterKey = null;
var siteDataList = new Array();

var w = null;

//********************************************
//Add event handlers to the worker object

function workerEventHandler(event) {    
    var data = JSON.parse(event.data);    
    console.log(data);

    if ( data.type == "mainKey" ) {
        masterKey = data.data;
        updateSiteList( data.siteList );
        document.getElementById("progress").src = "blank.gif";
        document.getElementById('compute').value = 100;        
        startSiteWorker();        
    } else if ( data.type == "password" ) {                   
        document.getElementById("sitePassword").value = data.data;  
        document.getElementById("progress").src = "blank.gif";
        document.getElementById('compute').value = 100;        
    } else  if ( data.type == "progress" ) {        
        document.getElementById("compute").value = data.data;
    } else {
       document.getElementById("sitePassword").value = "Error: " + data.data;
    }    
};

function updateSiteList( sList ) {
    //Clear out any members from the site selection list.
    siteDataList = new Array();    

    //Add the site names to their list.
    for ( var i = 0; i < sList.length; i++ ) {
        var entry = { label: sList[i].siteName, value: JSON.stringify(sList[i]) }
        siteDataList[i] = entry;        
    }
    console.log( siteDataList );
}

//******************************
//Make all siteInput elements recompute the site password.
inputList = document.getElementsByClassName("siteInput");
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", startSiteWorker);        
}
document.getElementById("siteType").addEventListener( "change", startSiteWorker );


function startSiteWorker() {        
    //Build a message from the form to send
    var data = {};
    data.masterKey = masterKey;
    data.siteName = document.getElementById('siteNameList').value;
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

    document.getElementById("progress").src = "ajax-loader.gif";                                  
}

//******************************
// Make all mainInputChanges start the secret key computation, interrupting old ones.
inputList = document.getElementsByClassName("mainInput");
for ( var i = 0; i < inputList.length; i++ ) {
	inputList[i].addEventListener("input", onMainInputChange);
}

function onMainInputChange() {
    document.getElementById("sitePassword").value = "";
    masterKey = null; //Reset the masterKey.    
    
    //Terminate the worker if it isn't null
    if ( w != null ) {
        w.terminate();
    }
    
    //Start the worker.
    w = new Worker("../js/mpw_worker.js");
    //Add a listener to the worker
    w.addEventListener( "message", workerEventHandler, false);
    
    //Build a message from the form to send
    var data = {};
    data.userName = document.getElementById('userName').value;
    data.masterPassword = document.getElementById('masterPassword').value;
    data.command = "mainCompute";    
    var jsonString = JSON.stringify(data);
        
    //Start the progress tickers.
    document.getElementById("progress").src = "ajax-loader.gif";               
    document.getElementById("compute").value = 0;

    //And unlock the lower half of the input.
    unlockSiteInput();
    
    //Send a message to start the process.
    w.postMessage(jsonString);                      
}

//***************************************************************
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

//****************************************
//Add an event listener to handle when a stored site is selected.
document.getElementById("siteNameList").addEventListener( "change", onStoredSiteChanged );
function onStoredSiteChanged( event ) {
    var siteInfo = JSON.parse(document.getElementById("siteNameList").value);
    document.getElementById("siteName").value = siteInfo.siteName;
    document.getElementById("siteType").value = siteInfo.siteType;
    document.getElementById("siteCounter").value = siteInfo.siteCounter;
    startSiteWorker();
}

//**************************************
//Utility function to unlock lower parts of the UI
function unlockSiteInput()
{
    var siteInput = document.getElementsByClassName("siteInput");
    for ( i = 0; i < siteInput.length; i++ ) {
        siteInput[i].disabled = false;
    }
}

//JQuery stuff
$(function() {    
    $( "#siteNameList" ).autocomplete({        
        source: siteDataList,
        autoFocus: true
    });
  });
