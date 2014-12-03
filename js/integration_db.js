
var siteDataList = {};
var dbPassword = "";
var currentLoginStatus = false;
var idb = new IntegrationDB();
dbWorker = new Worker('../js/database_worker_wrapper.js');    
dbWorker.addEventListener( "message", workerEventHandler, false);

function workerEventHandler(event) {    
    var data = JSON.parse(event.data);    
    console.log(data);

    if ( data.type === "siteList" ) {
        $( "#progress" ).progressbar( "value", 0 );
        idb.updateSiteList( data.siteList );                
    } else if ( data.type === "userSubmitted" ) {                
        $( "#progress" ).progressbar( "value", 0 );
        $("#createUserDialog").dialog("close");
        if ( data.data === "DUPLICATE_USER" ) {
            popupDialog( "Duplicate users", "A user with the same username or email allready exists in the database." );        
            idb.setLoginStatus(false);
        } else {        
            idb.setLoginStatus(true);            
        }
        idb.setAddAndDeleteButtonStatus();
    } else if ( data.type === "siteSaved" ) {        
        $( "#progress" ).progressbar( "value", 0 );        
        idb.addSitenameToList(data.data);
        idb.setAddAndDeleteButtonStatus();
    } else if ( data.type === "siteDeleted" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        idb.deleteSiteFromList(data.data);        
        idb.setAddAnddeleteButtonStatus();
    } else if ( data.type === "badLogin" ) {        
        $( "#progress" ).progressbar( "value", 0 );
        idb.setLoginStatus(false);     
        idb.setAddAnddeleteButtonStatus();        
    } else if ( data.type === "goodLogin" ) {                        
        idb.setLoginStatus(true);
        idb.setAddAndDeleteButtonStatus();        
    } else {        
       $("#progress" ).progressbar( "value", 0 );
        popupDialog( "Unexpected Error", data.message );                 
    }    
}

function IntegrationDB()
{    
    this.initDOMElements = function() {
        if ( typeof(Recaptcha) === "undefined" ) {
            console.log("Recapcha wasn't defined. Exiting.");
            setMainDivHTML("Sorry, recapcha has failed.");                        
            throw new Exception ( "Recapthca did not load properly" );
        }
        
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
            }           
        });

        //Add validation checks to create user dialog
        $("#userName2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );    
        $("#masterPassword2").on( "change keyup paste mouseup", updateCreateUserDialogStatus );        
        $("#email").on( "change keyup paste mouseup", updateCreateUserDialogStatus );                            
        
        function updateCreateUserDialogStatus ()
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
        };
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
    };
    
    this.setLoginStatus = function( status ) {    
        currentLoginStatus = status;
        if ( status === true ) {        
            $("#createUser").attr( "style", "display: none;" );
            $("#loginOK").attr( "style", "" );        
        } else {
            siteDataList = {};
            $( "#createUser").button("enable");        
            $("#createUser").attr( "style", "" );
            $("#loginOK").attr( "style", "display: none;" );
        }
    };        
    
    this.requestSiteList = function( )
    {
        $( "#progress" ).progressbar( "value", false );    
        var data = getAllInputsFromForm();    
        data.dbPassword = dbPassword;
        data.command = "getSiteList";    
        dbWorker.postMessage(JSON.stringify(data));
    };
    
    this.setAddAndDeleteButtonStatus = function() 
    {
        setAddButtonStatus();
        setDeleteButtonStatus();
        
        function setDeleteButtonStatus() 
        {    
            var data = getAllInputsFromForm();

            if ( siteDataList[data.siteName] !== undefined && currentLoginStatus ) {
                $("#deleteSite").button("enable");
            } else {
                $("#deleteSite").button("disable");
            }    
        };

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
        };
    };
    
    this.updateSiteList = function( sList ) 
    {    
        siteDataList = {};   

        //Add the site names to their list.
        keys = Object.keys(sList);
        for ( var i = 0; i < keys.length; i++ ) {        
            var siteName = keys[i];        
            siteDataList[siteName] = sList[siteName];         
        }

        //Make sure the save and delete buttons are correct.
        this.setAddAndDeleteButtonStatus();        
    };
    
    this.getAutocompleteResult = function(request,response) { 
        var keys = Object.keys(siteDataList);            
        keys.sort();
        keys = keys.filter( function(val) { 
            var r = val.match(request.term); 
            return r !== null;
        } );
        response(keys);
    };
    
    this.addSitenameToList = function ( data ) {
        var siteName = data.siteName;        
        siteDataList[siteName] = data;
    };
    
    this.deleteSiteFromList = function ( siteName ) {                
        delete siteDataList[siteName];        
    };

    this.siteNameListInput = function()
    {
        var data = getAllInputsFromForm();
        var siteData = siteDataList[data.siteName];    
        if ( siteData !== undefined && siteData !== null ) {
            $("#siteCounter").val(siteData.siteCounter);
            $("#siteType").val(siteData.siteType);        
            $("#siteType").selectmenu("refresh"); //Make sure the selector box is completely refreshed.
        }
        this.setAddAndDeleteButtonStatus();        
    };
 
    this.getDbPassword = function() 
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
    };
    
    this.setDbPassword = function(data)
    {
        dbPassword = data;
    };

}


