//Account for recaptcha: mpw.jscript@gmail.com
//TODO: Make sure site boxes are disabled if username of MPW is changed untill new seed is computed.
//TODO: Break out all common parts of integration.js into single file.
//TODO: Move the prograssFun deeper into the loops to get a better responsivity.

////***************************************
// Declare all globals.
var siteDataList = {};
var currentLoginStatus = false;
var w = null;

function Worker() {
    this.postMessage = function( event ) {
        var worker = new MPWWorker();
        var data = {};
        data.data = event;
        worker.handleMessage(data, function (rValue) {
            workerEventHandler( { data: JSON.stringify(rValue)} );    
        });
    };

    this.terminate = function() {};
    
    this.addEventListener = function() {};
}


        
//Wrap all initializatio
$(document).ready(function(){

    //Check if we should even be here.
    if(!window.Worker) { 
        //TODO: Check that this works.
        setMainDiv("Sorry, your browser does not support Web Workers...");                
        return;
    } 

    //Create the progress bar
    $( "#progress" ).progressbar({
        value: 0
    });
    
    $( "#compute").button( {
        disabled: false,
        label: "Compute"       
    });    
    
    $( "#compute").click( onMainInputChange );
    
    //Create the site counter
    $( "#siteCounter" ).spinner({ 
        min: 1, 
        numberFormat: "n",
        change: startSiteWorker,
        stop: startSiteWorker
    });
    
    //We need to add this one as well to handle text input.
    $("#siteCounter").on( "change keyup paste mouseup", onInputNumberChange );    

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

    $("#siteName").on( "change keyup paste mouseup", function () { 
        siteNameListInput(); 
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
               
    //Finally, we swap out the loading code and swap in the real content.
    $("#loaderDiv").attr( "style", "display: none;" );
    $("#mainDiv").attr( "style", "" );
});

function setLoginStatus( status ) {    
    currentLoginStatus = status;
    if ( status === true ) {        
        $("#createUser").attr( "style", "display: none;" );
        $("#loginOK").attr( "style", "" );        
    } else {
        $( "#createUser").button("enable");        
        $("#createUser").attr( "style", "" );
        $("#loginOK").attr( "style", "display: none;" );
    }
}

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
    var field01Val = $(field01).val();
    var field02Val = $(field02).val();
    if ( field01Val !== field02Val ) {
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
        $( "#progress" ).progressbar( "value", 0 );        
        startSiteWorker();                
    } else if ( data.type === "sitePassword" ) {                   
        $("#sitePassword").val( data.data );          
        $( "#progress" ).progressbar( "value", 0 );

    } else  if ( data.type === "progress" ) {                
        //Do nothing right now.
        //$( "#compute" ).progressbar( "value", data.data );

    } else if ( data.type === "userSubmitted" ) {
        console.log( "User submitted" );
        console.log( data.data );        
        //TODO: Whenever we close the user creation dialog, we should clear all values.
        $("#createUserDialog").dialog("close");
        if ( data.data === "DUPLICATE_USER" ) {
            popupDialog( "Duplicate users", "A user with the same username or email allready exists in the database." );        
        }
        $( "#progress" ).progressbar( "value", 0 );
        setLoginStatus(true);
    } else if ( data.type === "siteSaved" ) {
        console.log( "Site saved:" );
        console.log( data.data );            
        var siteName = data.data.siteName;        
        siteDataList[siteName] = data.data;
        setAddButtonStatus();
        setDeleteButtonStatus();
        $( "#progress" ).progressbar( "value", 0 );
    } else if ( data.type === "siteDeleted" ) {
        console.log( "Site deleted:" );
        console.log( data.data );            
        var siteName = data.data;
        delete siteDataList[siteName];
        setAddButtonStatus();
        setDeleteButtonStatus();
        $( "#progress" ).progressbar( "value", 0 );
    } else if ( data.type === "badLogin" ) {        
        setLoginStatus(false);     
        setAddButtonStatus();
        setDeleteButtonStatus();
    } else if ( data.type === "goodLogin" ) {                
        setLoginStatus(true);
        setAddButtonStatus();
        setDeleteButtonStatus();    
    } else {        
        $("#progress" ).progressbar( "value", 0 );
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
    
    //Build a message from the form to send
    var data = getAllInputsFromForm();    
    data.command = "siteCompute";    
    if ( isNaN(data.siteCounter) ) { 
        document.getElementById("sitePassword").value = "N/A";  
        return;
    }    
    
    $( "#progress" ).progressbar( "value", false );

    var jsonString = JSON.stringify(data);
    
    if ( w === null ) {
        //If we don't have a worker, we need to compute the masterSeed first.
        onMainInputChange();
    }

    //Send a message to start the process.    
    w.postMessage(jsonString);                          
}


function onMainInputChange() {
    $("#sitePassword").val( "" );    
    $( "#createUser").button("disable");        
    $( "#loginOK").attr("style", "display: none;");        
    $("#saveSite").button("disable");
    $("#deleteSite").button("disable");
    
    //Clear the local cache and login status
    currentLoginStatus = false;
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
    var siteCounter = $("#siteCounter");
    var value = parseInt(siteCounter.val());
    if ( isNaN(value) ) {
        siteCounter.addClass("ui-state-error");    
    } else {
        siteCounter.removeClass("ui-state-error");        
    }    
    startSiteWorker();
}

function siteNameListInput( )  
{
    var siteName = $("#siteName").val();
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