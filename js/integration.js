//Account for recaptcha: mpw.jscript@gmail.com

////***************************************
// Declare all globals.
var w = null;
var toSendMainComputeEvent = false;
var toSendSiteComputeEvent = false;
var idb = new IntegrationDB();

//************************************************
//Wrap all initialization
$(document).ready(function(){            
    
    //Check if we should even be here.
    if(!window.Worker) {         
        setMainDivHTML("Sorry, your browser does not support Web Workers...");                
        return;
    }     

    // Make all mainInputChanges start the secret key computation, interrupting old ones.
    setEventHandlerOnClass( "mainInput", "input", function(){onMainInputChange(false);} );           

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
        //We do not need to wait since these events do not come too often.
        select: function(){ startSiteWorker(true); }
    });
    
    $("#siteName").on( "change keyup paste mouseup", function (event) {        
        startSiteWorker(); 
    });
    
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
                         
    idb.initDOMElements();
    
    //Finally, we swap out the loading code and swap in the real content.
    $("#loaderDiv").attr( "style", "display: none;" );
    $("#mainDiv").attr( "style", "" );
});

function createWorker(tagName) {
    //For offline-more
    tagName = "#" + tagName;
    var base_url = window.location.href.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
    var array = ['var base_url = "' + base_url + '/";' + $(tagName).html()];
    var blob = new Blob(array, {type: "text/javascript"});
    var url = window.URL.createObjectURL(blob);    
    //console.log( url );        
    
    var worker = new Worker(url);
    return worker;
}

//********************************************
//Add event handlers to the worker object
function workerEventHandler(event) {    
    var data = JSON.parse(event.data);    
    console.log(data);

    if ( data.type === "masterKey" ) {                       
        $( "#progress" ).progressbar( "value", 0 );
        startSiteWorker(true);
        idb.getDbPassword();
        
    } else if ( data.type === "dbPassword" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        idb.setDbPassword(data.data);
        idb.requestSiteList();                
        
    } else if ( data.type === "sitePassword" ) {                   
        $( "#progress" ).progressbar( "value", 0 );
        $("#sitePassword").val( data.data );          
        
    } else  if ( data.type === "progress" ) {                        
        $( "#progress" ).progressbar( "value", data.data );
        
    } else {        
        $("#progress" ).progressbar( "value", 0 );
        popupDialog( "Unexpected Error", data.message );         
        
    }    
};

//***********************************************
//Worker communication functions
function startSiteWorker(now) {                
    $( "#progress" ).progressbar( "value", false );    
    
    idb.setAddAndDeleteButtonStatus();    
    
    if ( toSendSiteComputeEvent ) {
        console.log( "Site Compute event skipped" );
    }
    if ( now ) {
        doStartSiteWorker();
    } else {
        toSendSiteComputeEvent = true;
        setTimeout( function() {
            if ( !toSendSiteComputeEvent ) {            
                return;
            } else {
                toSendSiteComputeEvent = false;
            }
            doStartSiteWorker();
        }, 100 );    
    }
    
    //A subfunction to do the actual submit.
    function doStartSiteWorker() 
    {
        var data = getAllInputsFromForm();    
        data.command = "siteCompute";    
        if ( isNaN(data.siteCounter) ) { 
            document.getElementById("sitePassword").value = "N/A";  
            return;
        }            

        //If we don't have a worker, we need to compute the masterKey first.
        if ( w === null ) {    
            onMainInputChange(true);
        }    
        w.postMessage(JSON.stringify(data));                          
    }
}


function onMainInputChange( now ) {
    $( "#progress" ).progressbar( "value", 0 );    
           
    idb.setLoginStatus( false ); //This activates/shows the createUser buton which is therefore hidden on the next line below.    
    idb.setLoginAndStoreButtonsDisabled();    
    
    $("#sitePassword").val( "" );        
                    
    
    if ( now ) {
        //If we have been flagged to perform the action immediately.
        doOnMainInputChange();
    } else {
        //Otherwise, we use a setTimout to schedule it a bit later and avoid recomputing things many times.        
        toSendMainComputeEvent = true;

        setTimeout( function() {
            if ( !toSendMainComputeEvent ) {            
                return;
            } else {
                toSendMainComputeEvent = false;
            }
            doOnMainInputChange();
            console.log( "Event fired" );
        }, 1000 );  //Wait 1000ms before taking action.      
    }
    
    function doOnMainInputChange() {
        //Build a message from the form to send
        var data = getAllInputsFromForm();    
        data.command = "mainCompute";        

        //Terminate the worker if it isn't null. Whenever the main input changes, 
        //any previous computations are obsolete.
        if ( w !== null ) {
            w.terminate();
        }        

        //Start the worker and add a listener to the worker
        w = createWorker('mpw_worker_wrapper');            
        w.addEventListener( "message", workerEventHandler, false);

        w.postMessage(JSON.stringify(data));
    }
}



function onInputNumberChange() {    
    var data = getAllInputsFromForm();    
    if ( isNaN(data.siteCounter) ) {
        $("#siteCounter").addClass("ui-state-error");    
    } else {
        $("#siteCounter").removeClass("ui-state-error");        
    }    
    startSiteWorker();
}

function siteNameListInput( )  
{
    idb.siteNameListInput();
    startSiteWorker();
}