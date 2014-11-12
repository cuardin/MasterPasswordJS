//Account for recaptcha: mpw.jscript@gmail.com

////***************************************
// Declare all globals.
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
    $("#createUserDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 350,
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
        },
        open: function()
        {            
            updateCreateUserDialogStatus();
            
        },
        close: function() 
        { 
            Recaptcha.reload(); 
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
    $("#userName2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );    

    $("#masterPassword2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );    
    
    $("#email").on( "change keyup paste mouseup", updateCreateUserDialogStatus );            
    
    //Finally, we swap out the loading code and swap in the real content.
    $("#loaderDiv").attr( "style", "display: none;" );
    $("#mainDiv").attr( "style", "" );
});

function createWorker() {
    var base_url = window.location.href.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
    var array = ['var base_url = "' + base_url + '/";' + $('#mpw_worker').html()];
    var blob = new Blob(array, {type: "text/javascript"});
    var url = window.URL.createObjectURL(blob);    
    console.log( url );
    var worker = new Worker(url);
    return worker;
}

function setLoginStatus( status ) {
    //TODO: Have the enclosing createUser button and login ok alternate.
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
function updateCreateUserDialogStatus()
{
    validateTwoFieldsSame( "#userName", "#userName2" );    
    validateTwoFieldsSame( "#masterPassword", "#masterPassword2" );    
    validateEmail( "#email" );          
    
    var uNameBad = $("#userName2").hasClass("ui-state-error");
    var passBad = $("#masterPassword2").hasClass("ui-state-error");
    var emailBad = $("#email").hasClass("ui-state-error");    
    
    if ( !uNameBad && !passBad && !emailBad ) {
        $(".ui-dialog-buttonpane button:contains('Submit')").button('enable');
    } else {
        $(".ui-dialog-buttonpane button:contains('Submit')").button('disable');
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
        $( "#progress" ).progressbar( "value", 0 );
        startSiteWorker();
        getDbPassword();
    } else if ( data.type === "dbPassword" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        requestSiteList(data.data);                
    } else if ( data.type === "siteList" ) {
        $( "#progress" ).progressbar( "value", 0 );
        updateSiteList( data.siteList );                
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
function getDbPassword() {
    $( "#progress" ).progressbar( "value", false );
    //Build a message from the form to send
    var data = getAllInputsFromForm();        
    data.command = "getDbPassword";
    var jsonString = JSON.stringify(data);
    
    if ( w === null ) {
        //If we don't have a worker, we need to compute the masterSeed first.
        onMainInputChange();
    } else {
        //Send a message to start the process.    
        w.postMessage(jsonString);                          
    }
}

function requestSiteList( dbPass )
{
    $( "#progress" ).progressbar( "value", false );
    //Build a message from the form to send
    var data = getAllInputsFromForm();    
    data.dbPassword = dbPass;
    data.command = "getSiteList";
    
    var jsonString = JSON.stringify(data);
    
    if ( w === null ) {
        //If we don't have a worker, we need to compute the masterSeed first.
        onMainInputChange();
    } else {
        //Send a message to start the process.    
        w.postMessage(jsonString);                          
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
    w = createWorker();
    
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