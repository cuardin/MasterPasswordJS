//***************************************
// Declare all globals.
var userName = null;
var masterPassword = null;
var masterKey = JSON.parse("[142,75,182,210,3,70,175,186,7,179,19,96,59,154,177,216,130,111,83,105,55,224,128,48,220,214,243,112,168,191,84,175,75,41,45,198,197,49,203,112,1,164,129,172,205,25,192,113,121,49,13,241,85,209,200,132,182,223,213,193,175,177,142,131]");
var siteDataList = {};

var w = null;

//Wrap all initializatio
$(document).ready(function(){

    //Check if we should even be here.
    if(!window.Worker) { 
        //TODO: Check that this works.
        setMainDiv("Sorry, your browser does not support Web Workers...");                
        return;
    } 

    // Make all mainInputChanges start the secret key computation, interrupting old ones.
    setEventHandlerOnClass( "mainInput", "input", onMainInputChange );           

    //Create the progress bar
    $( "#compute" ).progressbar({
        value: 100
    });

    //Create the site counter
    $( "#siteCounter" ).spinner({ 
        min: 1, 
        numberFormat: "n",
        change: startSiteWorker,
        stop: startSiteWorker
    });
    //We need to add this one as well to handle text input.
    setEventHandlerOnID( "siteCounter", "input", onInputNumberChange );    

    //Create the site type menu
    $( "#siteType" ).selectmenu({    
        select: startSiteWorker
    });

    //Create the site name autocomplete.
    $( "#siteName" ).autocomplete({            
        source: function(request,response) { 
            var keys = Object.keys(siteDataList);            
            keys = keys.filter( function(val) { 
                var r = val.match(request.term); 
                return r !== null;
            } );
            response(keys);
        },
        autoFocus: true,        
        close: function(event,ui){ siteNameListInput(); },
        messages: {
            noResults: "",
            results: function() {}
        }        
    });

    $( "#saveSite").button( {
        disabled: true,
        label: "+"     
    });

    $( "#deleteSite").button( {
        disabled: true,
        label: "-"       
    });

    setEventHandlerOnID( "siteName", "input", function ( event ) {siteNameListInput();} );
    
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

    //Create the create new user popup
    $("#infoDialog").dialog({
        autoOpen: false,
        modal: true,        
        buttons: {
            "OK": function() {                
                $(this).dialog("close");           
            },             
        }
    });

    $("#saveSite").click( saveSite );

    $("#deleteSite").click( deleteSite );
    
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
        if ( $("#email2").val().length !== 0 ) {
            validateTwoFieldsSame( "#email", "#email2" );      
        }
    });            
});

function deleteSite()
{       
    //Create a job for the worker to submit the site to storage.
    var data = {};
    data.command = "deleteSite";    
    data.masterKey = masterKey;        
    data.userName = $("#userName").val();
        
    data.siteName = $("#siteName").val();
        
    var jsonString = JSON.stringify(data);
    if ( w === null ) {
        //In case a seed has not been computed yet.
        onMainInputChange();
    }
    
    //Send a message to start the process.
    w.postMessage(jsonString);                          
}


function saveSite()
{       
    //Create a job for the worker to submit the site to storage.
    var data = {};
    data.command = "saveSite";    
    data.masterKey = masterKey;        
    data.userName = $("#userName").val();
        
    data.site = {};
    data.site.siteName = $("#siteName").val();
    data.site.siteType = $("#siteType").val();
    data.site.siteCounter = $("#siteCounter").val();
        
    var jsonString = JSON.stringify(data);
    if ( w === null ) {
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
    if ( userName !== userName2 ) {
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

    if ( data.type === "masterKey" ) {
        masterKey = data.data;        
        console.log( "Master Key:" );
        console.log ( JSON.stringify(masterKey) );
        document.getElementById("progress").src = "blank.gif";                
        updateSiteList( data.siteList );
        $( "#compute" ).progressbar( "value", 100 );
        startSiteWorker();        

    } else if ( data.type === "sitePassword" ) {                   
        document.getElementById("sitePassword").value = data.data;  
        document.getElementById("progress").src = "blank.gif";
        document.getElementById('compute').value = 100;        

    } else  if ( data.type === "progress" ) {                
        $( "#compute" ).progressbar( "value", data.data );

    } else if ( data.type === "userSubmitted" ) {
        console.log( "User submitted" );
        console.log( data.data );
        //TODO: Whenever we close the user creation dialog, we should clear all values.
        $("#createUserDialog").dialog("close");
        if ( data.data === "DUPLICATE_USER" ) {
            console.log( "Opening duplicate user dialog" );
            $("#infoDialog").dialog("option", "title", "User allready exists");
            $("#infoDialog").dialog("open");
        }
    
    } else if ( data.type === "siteSaved" ) {
        console.log( "Site saved:" );
        console.log( data.data );            
        var siteName = data.data.siteName;        
        siteDataList[siteName] = data.data;
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else if ( data.type === "siteDeleted" ) {
        console.log( "Site deleted:" );
        console.log( data.data );            
        var siteName = data.data;
        delete siteDataList[siteName];
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else {
       document.getElementById("sitePassword").value = "Error: " + data.data;
    }    
};

function setDeleteButtonStatus() 
{    
    var siteName = $("#siteName").val();    
    if ( siteDataList[siteName] !== undefined ) {
        $("#deleteSite").button("enable");
    } else {
        $("#deleteSite").button("disable");
    }    
}

function setAddButtonStatus() 
{    
    var siteName = $("#siteName").val();
    var siteCounter = $("#siteCounter").val();
    var siteType = $("#siteType").val();

    var closestMatch = siteDataList[siteName];
    var matchExists = false;
    if ( closestMatch === undefined ) {
        matchExists = false;
    } else {
        matchExists = (closestMatch.siteCounter === siteCounter && closestMatch.siteType === siteType);
    }    
    if ( matchExists ) {
        $("#saveSite").button("disable");
    } else {
        $("#saveSite").button("enable");
    }    
}

function updateSiteList( sList ) {    
    siteDataList.length = 0;     

    console.log( sList );
    
    if ( sList === "badLogin" ) {                
        $("#createUserDialog").dialog("open");        
        return;    
    } else if ( sList === "unvalidatedUser" ) {
        $("#infoDialog").dialog("option", "title", "User not validated");
        $("#infoDialog").dialog("open");        
        return;
    }

    //Add the site names to their list.
    keys = Object.keys(sList);
    for ( var i = 0; i < keys.length; i++ ) {        
        var siteName = keys[i];
        siteDataList[siteName] = sList[siteName]; 
    }
}

function startSiteWorker() {        
    //Make sure the save and delete buttons are correct.
    setAddButtonStatus();
    setDeleteButtonStatus();

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
    
    if ( w === null ) {
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
    if ( w !== null ) {
        w.terminate();
    }
    
    //Start the worker.
    w = new Worker("../js/mpw_worker.js?a=8");
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
    
    //Send a message to start the process.
    w.postMessage(jsonString);                      
}

function onInputNumberChange() {
    var siteCounter = document.getElementById("siteCounter");
    var value = parseInt(siteCounter.value);
    if ( isNaN(value) ) {
        siteCounter.style="box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -moz-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px; -webkit-box-shadow: rgba(256,0,0, 0.5) 0px 0px 8px;";
    } else {
        siteCounter.style="";
    }
    startSiteWorker();
}

function siteNameListInput( )  
{
    var siteName = document.getElementById("siteName").value;
    console.log( siteName );
    var siteData = siteDataList[siteName];    
    if ( siteData !== undefined && siteData !== null ) {
        $("#siteCounter").val(siteData.siteCounter);
        $("#siteType").val(siteData.siteType);        
        $("#siteType").selectmenu("refresh");    
    }
    startSiteWorker();
}