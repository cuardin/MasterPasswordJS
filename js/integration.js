//Account for recaptcha: mpw.jscript@gmail.com

////***************************************
// Declare all globals.
var siteDataList = {};
var currentLoginStatus = false;
var dbPassword = "";
var w = null;
var dbWorker = createWorker('database_worker_wrapper');
dbWorker.addEventListener( "message", workerEventHandler, false);

//************************************************
//Wrap all initialization
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
        change: onInputNumberChange,
        stop: onInputNumberChange
    });        
    $("#siteCounter").on( "change keyup paste mouseup", onInputNumberChange );    

    //Create the site type menu
    $( "#siteType" ).selectmenu({    
        select: startSiteWorker
    });

    //Create the site name autocomplete.
    $( "#siteName" ).autocomplete({            
        source: function(request,response) { 
            var keys = Object.keys(siteDataList);            
            keys.sort();
            keys = keys.filter( function(val) { 
                var r = val.match(request.term); 
                return r !== null;
            } );
            response(keys);
        },
        autoFocus: true,        
        close: siteNameListInput               
    });
    $("#siteName").on( "change keyup paste mouseup", function () { 
        siteNameListInput(); 
    });

    //Save, delete and create user buttons.
    $( "#saveSite").button( {
        disabled: true,
        label: "+"     
    });
    $("#saveSite").click( saveSite );

    $( "#deleteSite").button( {
        disabled: true,
        label: "-"       
    });
    $("#deleteSite").click( deleteSite );
    
    $( "#createUser").button( {
        disabled: true,
        label: "Create User"       
    });
    $("#createUser").click( function( ) {
        $("#createUserDialog").dialog("open");
    });           
    
    //Create the create new user popup
    $("#createUserDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 350,        
        buttons: {
            "Cancel": function() {                
                $(this).dialog("close");                           
            }, 
            "Submit": function() {
                //SubmitUser starts a worker in the background that submits the user and then closes the dialog.                
                $("#createUserSpinner").attr( "style", "" );
                submitUser();                
                Recaptcha.reload();
            }
        },
        open: function()
        {            
            $("#userName2").val( "" );
            $("#masterPassword2").val( "" );
            $("#email").val( "" );
            $("#createUserSpinner").attr( "style", "display: none;" );
            Recaptcha.reload(); 
            updateCreateUserDialogStatus();            
        },
        close: function() 
        { 
            //We used to have the recapcha reload here. If it works to have it above, then delete this stub.
        }                
        
    });
        
    //Add validation checks to create user dialog
    $("#userName2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );    
    $("#masterPassword2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );        
    $("#email").on( "change keyup paste mouseup", updateCreateUserDialogStatus );            

    //Create the info dialog popup. Used mostly for error messages.
    $("#infoDialog").dialog({
        autoOpen: false,
        modal: true,        
        buttons: {
            "OK": function() {                
                $(this).dialog("close");           
            }            
        }
    });       

    //Finally, we swap out the loading code and swap in the real content.
    $("#loaderDiv").attr( "style", "display: none;" );
    $("#mainDiv").attr( "style", "" );
});

function createWorker(tagName) {
    /*tagName = "#" + tagName;
    var base_url = window.location.href.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
    var array = ['var base_url = "' + base_url + '/";' + $(tagName).html()];
    var blob = new Blob(array, {type: "text/javascript"});
    var url = window.URL.createObjectURL(blob);    
    console.log( url );*/
    
    var url = "../js/" + tagName + ".js";
    var worker = new Worker(url);
    return worker;
}

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

function requestSiteList( )
{
    $( "#progress" ).progressbar( "value", false );    
    var data = getAllInputsFromForm();    
    data.dbPassword = dbPassword;
    data.command = "getSiteList";    
    dbWorker.postMessage(JSON.stringify(data));
}

function deleteSite()
{           
    $( "#progress" ).progressbar( "value", false );    
    var data = getAllInputsFromForm();
    data.dbPassword = dbPassword;
    data.command = "deleteSite";                        
    dbWorker.postMessage(JSON.stringify(data));                          
}


function saveSite()
{           
    $( "#progress" ).progressbar( "value", false );    
    var data = getAllInputsFromForm();
    data.dbPassword = dbPassword;
    data.command = "saveSite";                                    
    dbWorker.postMessage(JSON.stringify(data));                          
}

function submitUser()
{                
    $( "#progress" ).progressbar( "value", false );        
    var data = getAllInputsFromForm();
    data.dbPassword = dbPassword;
    data.command = "createUser";                    
    dbWorker.postMessage(JSON.stringify(data));                      
    
}

function validateTwoFieldsSame( field01, field02 ) 
{    
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
        dbPassword = data.data;
        requestSiteList();                
        
    } else if ( data.type === "siteList" ) {
        $( "#progress" ).progressbar( "value", 0 );
        updateSiteList( data.siteList );                
        
    } else if ( data.type === "sitePassword" ) {                   
        $( "#progress" ).progressbar( "value", 0 );
        $("#sitePassword").val( data.data );          
        
    } else  if ( data.type === "progress" ) {                        
        $( "#progress" ).progressbar( "value", data.data );
        
    } else if ( data.type === "userSubmitted" ) {                
        $( "#progress" ).progressbar( "value", 0 );
        $("#createUserDialog").dialog("close");
        if ( data.data === "DUPLICATE_USER" ) {
            popupDialog( "Duplicate users", "A user with the same username or email allready exists in the database." );        
        } else {        
            setLoginStatus(true);
        }
        
    } else if ( data.type === "siteSaved" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        var siteName = data.data.siteName;        
        siteDataList[siteName] = data.data;
        setAddButtonStatus();
        setDeleteButtonStatus();
        
    } else if ( data.type === "siteDeleted" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        var siteName = data.data;
        delete siteDataList[siteName];
        setAddButtonStatus();
        setDeleteButtonStatus();
        
        
    } else if ( data.type === "badLogin" ) {        
        $( "#progress" ).progressbar( "value", 0 );
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
    var data = getAllInputsFromForm();
    
    if ( siteDataList[data.siteName] !== undefined && currentLoginStatus ) {
        $("#deleteSite").button("enable");
    } else {
        $("#deleteSite").button("disable");
    }    
}

function setAddButtonStatus() 
{    
    var data = getAllInputsFromForm();
    
    var closestMatch = siteDataList[data.siteName];
    var matchExists = false;
    if ( closestMatch === undefined ) {
        matchExists = false;
    } else {
        matchExists = (closestMatch.siteCounter === data.siteCounter && closestMatch.siteType === data.siteType);
    }    
    if ( !matchExists && currentLoginStatus ) {
        $("#saveSite").button("enable");
    } else {
        $("#saveSite").button("disable");        
    }    
}

function updateSiteList( sList ) {    
    siteDataList = {};   

    //Add the site names to their list.
    keys = Object.keys(sList);
    for ( var i = 0; i < keys.length; i++ ) {        
        var siteName = keys[i];        
        siteDataList[siteName] = sList[siteName];         
    }
    
    //Make sure the save and delete buttons are correct.
    setAddButtonStatus();
    setDeleteButtonStatus();    
}

//***********************************************
//Worker communication functions
function doStartWorker( data, chain ) {
    if ( w === null ) {
        //If we don't have a worker, we need to compute the masterKey first.
        onMainInputChange();
    }
    if ( (w === null && chain) || w !== null ) {
        //Send a message to start the process.    
        w.postMessage(JSON.stringify(data));                          
    } 
}

function getDbPassword() 
{
    $( "#progress" ).progressbar( "value", false );        
    var data = getAllInputsFromForm();        
    data.command = "getDbPassword";    
    
    //If we don't have a worker, we need to compute the masterKey first.
    if ( w === null ) {        
        onMainInputChange();
    } else {
        w.postMessage(JSON.stringify(data));                          
    }
}

function startSiteWorker() {                
    $( "#progress" ).progressbar( "value", false );    
    
    setAddButtonStatus();
    setDeleteButtonStatus();    
        
    var data = getAllInputsFromForm();    
    data.command = "siteCompute";    
    if ( isNaN(data.siteCounter) ) { 
        document.getElementById("sitePassword").value = "N/A";  
        return;
    }            
    
    //If we don't have a worker, we need to compute the masterKey first.
    if ( w === null ) {    
        onMainInputChange();
    }    
    w.postMessage(JSON.stringify(data));                          
    
}


function onMainInputChange() {
    $( "#progress" ).progressbar( "value", 0 );    
        
    //Clear the local cache and login status
    siteDataList = {};
    setLoginStatus( false ); //This activates/shows the createUser buton which is therefore hidden on the next line below.    
        
    $("#createUser").attr("style", "display: none;");        
    $("#loginOK").attr("style", "display: none;");            
    $("#saveSite").button("disable");
    $("#deleteSite").button("disable");            
    $("#sitePassword").val( "" );    
    
            
    //Terminate the worker if it isn't null. Whenever the main input changes, 
    //any previous computations are obsolete.
    if ( w !== null ) {
        w.terminate();
    }        
    
    //Start the worker and add a listener to the worker
    w = createWorker('mpw_worker_wrapper');            
    w.addEventListener( "message", workerEventHandler, false);
    
    //Build a message from the form to send
    var data = getAllInputsFromForm();    
    data.command = "mainCompute";        
                    
    //Send a message to start the process.
    w.postMessage(JSON.stringify(data));                      
}

function onInputNumberChange() {    
    var data = getAllInputsFromForm();    
    if ( isNaN(data.siteCounter) ) {
        siteCounter.addClass("ui-state-error");    
    } else {
        siteCounter.removeClass("ui-state-error");        
    }    
    startSiteWorker();
}

function siteNameListInput( )  
{
    var data = getAllInputsFromForm();
    var siteData = siteDataList[data.siteName];    
    if ( siteData !== undefined && siteData !== null ) {
        $("#siteCounter").val(siteData.siteCounter);
        $("#siteType").val(siteData.siteType);        
        $("#siteType").selectmenu("refresh"); //Make sure the selector box is completely refreshed.
    }
    setAddButtonStatus();
    setDeleteButtonStatus();
    startSiteWorker();
}