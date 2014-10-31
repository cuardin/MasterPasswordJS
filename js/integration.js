//Account for recaptcha: mpw.jscript@gmail.com


////***************************************
// Declare all globals.
//var userName = null;
//var masterPassword = null;
//var masterKey = new Array();
var siteDataList = {};
var currentLoginStatus = false;

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
    $( "#progress" ).progressbar({
        value: 0
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
    
    $( "#createUser").button( {
        disabled: true,
        label: "Create User"       
    });

    setEventHandlerOnID( "siteName", "input", function ( event ) {siteNameListInput();} );
    
    //Create the create new user popup
    $("#createUserDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 370,
        //TODO: Add a tag to this button so it can be enabled/disabled by the validations.
        buttons: {
            "Cancel": function() {                
                $(this).dialog("close");           
            }, 
            "Submit": function() {
                //SubmitUser starts a worker in the background that submits the user and then closes the dialog.
                //TODO: Add a spinner to the button when submiting.
                submitUser();                
                Recaptcha.reload();
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
            }            
        }
    });

    $("#saveSite").click( saveSite );

    $("#deleteSite").click( deleteSite );
    
    $("#createUser").click( function( ) {
        $("#createUserDialog").dialog("open");
    });           
    
    
    //Add validation checks to create user dialog
    document.getElementById("userName2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#userName", "#userName2" );    
    });            
    document.getElementById("masterPassword2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#masterPassword", "#masterPassword2" );    
    });        
    /*document.getElementById("email2").addEventListener( "input", function( event ) {
        validateTwoFieldsSame( "#email", "#email2" );    
    });*/            
    document.getElementById("email").addEventListener( "input", function( event ) {
        validateEmail( "#email" );  
        /*//Revalidate the second if it is not empty.
        if ( $("#email2").val().length !== 0 ) {
            validateTwoFieldsSame( "#email", "#email2" );      
        }*/
    });            
});

function deleteSite()
{       
    //Create a job for the worker to submit the site to storage.
    var data = getAllInputsFromForm();
    data.command = "deleteSite";        
        
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
    var data = getAllInputsFromForm();
    data.command = "saveSite";                    
    
    var jsonString = JSON.stringify(data);
    if ( w === null ) {
        onMainInputChange();
    }
    
    //Send a message to start the process.
    w.postMessage(jsonString);                          
}

function submitUser()
{                
    var data = getAllInputsFromForm();
    data.command = "createUser";    
        
    var jsonString = JSON.stringify(data);
    if ( w === null ) {
        onMainInputChange();
    }

    
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
        updateSiteList( data.siteList );        
        $( "#progress" ).progressbar( "value", 100 );
        startSiteWorker();                
    } else if ( data.type === "sitePassword" ) {                   
        $("#sitePassword").val( data.data );          
        $( "#progress" ).progressbar( "value", 100 );

    } else  if ( data.type === "progress" ) {                
        //Do nothing right now.
        //$( "#compute" ).progressbar( "value", data.data );

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
        $( "#progress" ).progressbar( "value", 100 );
        $( "#createUser").button("disable");
    } else if ( data.type === "siteSaved" ) {
        console.log( "Site saved:" );
        console.log( data.data );            
        var siteName = data.data.siteName;        
        siteDataList[siteName] = data.data;
        setAddButtonStatus();
        setDeleteButtonStatus();
        $( "#progress" ).progressbar( "value", 100 );
    } else if ( data.type === "siteDeleted" ) {
        console.log( "Site deleted:" );
        console.log( data.data );            
        var siteName = data.data;
        delete siteDataList[siteName];
        setAddButtonStatus();
        setDeleteButtonStatus();
        $( "#progress" ).progressbar( "value", 100 );
    } else if ( data.type === "badLogin" ) {
        $( "#createUser").button("enable");        
        currentLoginStatus = false;
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else if ( data.type === "goodLogin" ) {        
        currentLoginStatus = true;
        $( "#createUser").button("disable");
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else if ( data.type === "unvalidatedUser" ) {
        popupDialog( "Error", "<p>User not validated</p>" );        
        currentLoginStatus = false;
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else {        
        $("#progress" ).progressbar( "value", 100 );
        popupDialog( "Unexpected Error", data.message );         
    }    
};

function setDeleteButtonStatus() 
{    
    var siteName = $("#siteName").val();    
    if ( siteDataList[siteName] !== undefined && currentLoginStatus ) {
        $("#deleteSite").button("enable");
    } else {
        $("#deleteSite").button("disable");
    }    
}

function setAddButtonStatus() 
{    
    var siteName = $("#siteName").val();
    var siteCounter = parseInt($("#siteCounter").val());
    var siteType = $("#siteType").val();

    var closestMatch = siteDataList[siteName];
    var matchExists = false;
    if ( closestMatch === undefined ) {
        matchExists = false;
    } else {
        matchExists = (closestMatch.siteCounter === siteCounter && closestMatch.siteType === siteType);
    }    
    if ( !matchExists && currentLoginStatus ) {
        $("#saveSite").button("enable");
    } else {
        $("#saveSite").button("disable");        
    }    
}

function updateSiteList( sList ) {    
    siteDataList.length = 0;     

    console.log( sList );        

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

    $( "#progress" ).progressbar( "value", false );
    
    //Build a message from the form to send
    var data = getAllInputsFromForm();    
    data.command = "siteCompute";    
    if ( isNaN(data.siteCounter) ) { 
        document.getElementById("sitePassword").value = "N/A";  
        return;
    }    

    var jsonString = JSON.stringify(data);
    
    if ( w === null ) {
        //If we don't have a worker, we need to compute the masterSeed first.
        onMainInputChange();
    }

    //Send a message to start the process.    
    w.postMessage(jsonString);                          
}


function onMainInputChange() {
    document.getElementById("sitePassword").value = "";    
    //Clear the local cache
    siteDataList = {};
    
    $( "#progress" ).progressbar( "value", false );    
    
    //Terminate the worker if it isn't null
    if ( w !== null ) {
        w.terminate();
    }
    
    //Start the worker.
    w = new Worker("../js/mpw_worker.js");
    //Add a listener to the worker
    w.addEventListener( "message", workerEventHandler, false);
    
    //Build a message from the form to send
    var data = getAllInputsFromForm();    
    data.command = "mainCompute";    
    var jsonString = JSON.stringify(data);
                    
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
    setAddButtonStatus();
    setDeleteButtonStatus();
    startSiteWorker();
}