//***************************************
// Declare all globals.
var userName = null;
var masterPassword = null;
var masterKey = null;
var siteDataList = new Array();
var siteNames = new Array();

var w = null;

//Wrap all initializatio
$(document).ready(function(){
    //Check if we should even be here.
    if(!window.Worker) { 
        $("mainDiv").html("Sorry, your browser does not support Web Workers...");        
        return;
    } 

    // Make all mainInputChanges start the secret key computation, interrupting old ones.
    //jQuery does not seem to support input events.
    inputList = document.getElementsByClassName("mainInput");
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].addEventListener("input", onMainInputChange);
    }

    
    //Add an event listener to check that number is properly entered.
    document.getElementById("siteCounter").addEventListener( "input", onInputNumberChange );

    //Create the progress bar
    $( "#compute" ).progressbar({
        value: 100,    
    });

    //Create the site counter
    $( "#siteCounter" ).spinner({ 
        min: 1, 
        numberFormat: "n",
        change: startSiteWorker,
        stop: startSiteWorker,
    });

    //Create the site type menu
    $( "#siteType" ).selectmenu({    
        select: startSiteWorker
    });

    //Create the site name autocomplete.
    $( "#siteNameList" ).autocomplete({            
        source: siteNames,
        autoFocus: true,        
        select: function(event,ui){ siteNameListInput(ui.item.label) },
        messages: {
            noResults: "",
            results: function() {}
        }        
    });

    document.getElementById("siteNameList").addEventListener( "input", function ( event ) {
        siteNameListInput( document.getElementById("siteNameList").value );    
    });

    //Create the create new user popup
    $("#createUserDialog").dialog({
        autoOpen: true,
        modal: true,
        buttons: {
            "Done": function() {
                $(this).dialog("close");
            }
        }
    });

    //Add validation checks to create user dialog
    document.getElementById("userName2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#userName", "#userName2" );    
    });            
    document.getElementById("masterPassword2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#masterPassword", "#masterPassword2" );    
    });        
    document.getElementById("email2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#email", "#email2" );    
    });        
});

function validateTwoFieldsSame( field01, field02 ) 
{
    var userName = $(field01).val();
    var userName2 = $(field02).val();
    if ( userName != userName2 ) {
        $(field02).addClass("ui-state-error");
    } else {
        $(field02).removeClass("ui-state-error");
    }

}

//********************************************
//Add event handlers to the worker object
function workerEventHandler(event) {    
    var data = JSON.parse(event.data);    
    console.log(data);

    if ( data.type == "mainKey" ) {
        masterKey = data.data;
        updateSiteList( data.siteList );
        document.getElementById("progress").src = "blank.gif";        
        $( "#compute" ).progressbar( "value", 100 );
        startSiteWorker();        
    } else if ( data.type == "password" ) {                   
        document.getElementById("sitePassword").value = data.data;  
        document.getElementById("progress").src = "blank.gif";
        document.getElementById('compute').value = 100;        
    } else  if ( data.type == "progress" ) {                
        $( "#compute" ).progressbar( "value", data.data );
    } else {
       document.getElementById("sitePassword").value = "Error: " + data.data;
    }    
};

function updateSiteList( sList ) {
    //Clear out any members from the site selection list.
    siteDataList.length = 0;
    siteNames.length = 0;
    
    console.log( sList );
    
    if ( sList == null ) {        
        $("#createUserDialog").dialog("open");        
        return;
    }

    //Add the site names to their list.
    for ( var i = 0; i < sList.length; i++ ) {        
        siteDataList[i] = sList[i];
        siteNames[i] = sList[i].siteName;
    }
    
}

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

function onInputNumberChange() {
    var siteCounter = document.getElementById("siteCounter")
    var value = parseInt(siteCounter.value);
    if ( isNaN(value) ) {
        siteCounter.style="box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -moz-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -webkit-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px;";
    } else {
        siteCounter.style="";
    }
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


function siteNameListInput( siteName )  
{
    console.log( siteName );
    var siteData = null;
    for ( var i = 0; i < siteNames.length; i++ ) {
        if ( siteNames[i] == siteName ) {
            siteData = siteDataList[i];
        }
    }
    if ( siteData != null ) {
        document.getElementById("siteCounter").value = siteData.siteCounter;
        document.getElementById("siteType").value = siteData.siteType;        
    }
    startSiteWorker();
}