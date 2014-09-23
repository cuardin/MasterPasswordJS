//***************************************
// Declare all globals.
var userName = null;
var masterPassword = null;
var masterKey = null;
var siteDataList = {};
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
    $( "#siteName" ).autocomplete({            
        source: siteNames,
        autoFocus: true,        
        select: function(event,ui){ siteNameListInput(ui.item.label) },
        messages: {
            noResults: "",
            results: function() {}
        }        
    });

    document.getElementById("siteName").addEventListener( "input", function ( event ) {
        siteNameListInput( document.getElementById("siteName").value );    
    });

    //Create the create new user popup
    $("#createUserDialog").dialog({
        autoOpen: false,
        modal: true,
        //TODO: Add a tag to this button so it can be enabled/disabled by the validations.
        buttons: {
            "Cancel": function() {                
                $(this).dialog("close");           
            }, 
            "Submit": function() {
                //SubmitUser starts a worker in the background that submits the user and then closes the dialog.
                //TODO: Add a spinner to the button when submiting.
                submitUser();                
            }
        }
    });

    $("#saveSite").click( saveSite );
    
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
    document.getElementById("email").addEventListener( "input", function( event ) {
        validateEmail( "#email" );  
        //Revalidate the second if it is not empty.
        if ( $("#email2").val().length != 0 ) {
            validateTwoFieldsSame( "#email", "#email2" );      
        }
    });            
});

function saveSite()
{       
    //Create a job for the worker to submit the site to storage.
    var data = {};
    data.command = "saveSite";    
    data.masterKey = masterKey;        
    data.userName = $("#userName").val();
        
    data.siteName = $("#siteName").val();
    data.siteType = $("#siteType").val();
    data.siteCounter = $("#siteCounter").val();
        
    var jsonString = JSON.stringify(data);
    if ( w == null ) {
        //In case a seed has not been computed yet.
        onMainInputChange();
    }
    
    //Send a message to start the process.
    w.postMessage(jsonString);                          
}

function submitUser()
{                
    var data = {};
    data.command = "createUser";    
    data.masterKey = masterKey;        
    data.userName = $("#userName").val();
    data.email = $("#email").val();
        
    var jsonString = JSON.stringify(data);
    
    //Send a message to start the process.
    w.postMessage(jsonString);                      
    
}

function validateTwoFieldsSame( field01, field02 ) 
{
    //TODO: Change the variable names here.
    var userName = $(field01).val();
    var userName2 = $(field02).val();
    if ( userName != userName2 ) {
        $(field02).addClass("ui-state-error");
    } else {
        $(field02).removeClass("ui-state-error");
    }

}

function validateEmail(field) { 
    var email = $(field).val();
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if ( !re.test(email) ) {
        $(field).addClass("ui-state-error");    
    } else {
        $(field).removeClass("ui-state-error");    
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

    } else if ( data.type == "userSubmitted" ) {
        console.log( "User submitted" );
        console.log( data.data );
        $("#createUserDialog").dialog("close");
    
    } else if ( data.type == "siteSaved" ) {
        console.log( "Site saved:" );
        console.log( data.data );            
        var siteName = data.data.siteName;
        if ( siteDataList[siteName] == null ) {
            //New site needs to be registered.
            siteNames[siteNames.length] = siteName;
        } 
        siteDataList[siteName] = data.data;

    } else {
       document.getElementById("sitePassword").value = "Error: " + data.data;
    }    
};

function updateSiteList( sList ) {
    //Clear out any members from the site selection list.
    siteDataList.length = 0;    
    siteNames.length = 0;

    console.log( sList );
    
    if ( sList == "badUserName" ) {        
        $("#createUserDialog").dialog("open");        
        return;
    } else if ( sList == "badPassword" ) {
        return;
    }

    //Add the site names to their list.
    for ( var i = 0; i < sList.length; i++ ) {        
        var siteName = sList[i].siteName;
        siteDataList[siteName] = sList[i];        
        siteNames[i] = siteName;
    }
    
}

function startSiteWorker() {        
    //Build a message from the form to send
    var data = {};
    data.masterKey = masterKey;
    data.siteName = document.getElementById('siteName').value;
    data.siteCounter = parseInt(document.getElementById('siteCounter').value);
    if ( isNaN(data.siteCounter) ) { 
        document.getElementById("sitePassword").value = "N/A";  
        return;
    }

    data.siteType = document.getElementById('siteType').value;
    data.command = "siteCompute";    
    var jsonString = JSON.stringify(data);
    
    if ( w == null ) {
        //If we don't have a worker, we need to compute the masterSeed first.
        onMainInputChange();
    }

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
    var siteData = siteDataList[siteName];    
    if ( siteData != null ) {
        document.getElementById("siteCounter").value = siteData.siteCounter;
        document.getElementById("siteType").value = siteData.siteType;        
    }
    startSiteWorker();
}