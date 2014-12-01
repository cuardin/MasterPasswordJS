<?php
    //Redirect if we get called on http.    
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ""){
        $redirect = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        header("Location: $redirect");        
    }       
    require_once( dirname(__FILE__).'/../../php_scripts/core/utilitiesSecret.php' );    
    require_once( dirname(__FILE__).'/../../php_scripts/core/utilities.php' );    
    init();
    $mysql = connectDatabase();
    try {
        $username = getParameter( "username");    
        $verificationKey = getParameter( "verificationKey" );
    } catch ( Exception $e ) {
        $username = "";
        $verificationKey = "";
    }
    
?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>MasterPassword: Password Reset</title>
    <link href="jquery-ui.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">    	            
    <meta name="apple-itunes-app" content="app-id=510296984" />
</head>
<body onbeforeunload="">    
    <div id="loaderDiv" class="mainDiv" style="text-align: center;">       
        <h1>Loading page</h1>        
        <img src="ajax-loader.gif">        
    </div>
    
    <div class="mainDiv" id="mainDiv" style="display: none;">                    
        <h1>Set new password</h1>
        <form>
            <p>
                <label for="userName">Username</label>
                <input type="text" id="userName" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="<?php echo $username ?>">
            </p>
            
            <p>
                <label for="verificationKey">Reset Key</label>
                <input type="text" id="verificationKey" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="<?php echo $verificationKey ?>">
            </p>
            
            <p>
                <label for="masterPassword">New master password</label>
                <input type="password" id="masterPassword" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="NewPass01">
            </p>
            
            <p>
                <label for="masterPassword2">New master password again</label>
                <input type="password" id="masterPassword2" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="NewPass01">
            </p>
            
            <p>
                <div id="progress" class="box"></div>
                <span style="float: right;">
                <button id="submitNewPass" type="button">Submit</button>
                </span>
            </p>
        </form>

    </div>
    <div id="infoDialog" style="display: none;">                        
    </div>
            
    <script src="external/jquery/jquery.js"></script>
    <script src="jquery-ui.js"></script>    
    <script src="../js/database_worker.js"></script>    <!-- For reload-->
    <script>   
        var w = null;
        var dbWorker = new Worker('../js/database_worker_wrapper.js');
        dbWorker.addEventListener( "message", passWorkerEventHandler, false);
        
        $(document).ready(function(){            
            //Check if we should even be here.
            if(!window.Worker) { 
                //TODO: Check that this works.
                setMainDiv("Sorry, your browser does not support Web Workers...");                
                return;
            }                                      
            
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
       
            //Create the progress bar
            $( "#progress" ).progressbar({
                value: 0
            });
            
            $( "#submitNewPass").button();
            
            //Finally, we swap out the loading code and swap in the real content.
            $("#loaderDiv").attr( "style", "display: none;" );
            $("#mainDiv").attr( "style", "" );
        });                
        
        $("#submitNewPass").click( submitNewPass );
        
        function submitNewPass() {
            if ( w !== null ) {
                w.terminate();
            } 
            w = new Worker( '../js/mpw_worker_wrapper.js' );
            w.addEventListener( "message", passWorkerEventHandler, false );                                    

            var data = {};
            data.command = "mainCompute";
            data.masterPassword = $('#masterPassword').val();
            data.userName = $('#userName').val();
            w.postMessage(JSON.stringify(data));
            
            //Lock the UI untill we are done
            $("#userName").prop("disabled",true);
            $("#verificationKey").prop("disabled",true);
            $("#masterPassword").prop("disabled",true);
            $("#masterPassword2").prop("disabled",true);
        }
        
        function passWorkerEventHandler(event) {
            var data = JSON.parse(event.data);    
            console.log(data);
            
            if ( data.type === "masterKey" ) {                       
                //TODO: Add a progress bar for this.
                var data = {};
                data.command = "getDbPassword";    
                w.postMessage(JSON.stringify(data));
                $( "#progress" ).progressbar( "value", 100 );
            } else if ( data.type === "dbPassword" ) {                        
                var dbPassword = data.data;
                var data = {};
                data.command = "setNewPassword";    
                data.userName = $('#userName').val();
                data.dbPassword = dbPassword;
                data.verificationKey = $('#verificationKey').val();
                dbWorker.postMessage(JSON.stringify(data));            
            } else if ( data.type === "progress" ) {                                            
                $( "#progress" ).progressbar( "value", data.data );
            } else if ( data.type === "newPasswordSet" ) {                            
                $("#infoDialog").dialog("option", "title", "OK");
                $("#infoDialog").html( "<p>New password set.</p>" );
                $("#infoDialog").dialog("open");                                                
                
                //Unlock the UI now that we are done
                $("#userName").attr("disabled",false);
                $("#verificationKey").attr("disabled",false);
                $("#masterPassword").attr("disabled",false);
                $("#masterPassword2").attr("disabled",false);
            } else {
                $("#infoDialog").dialog("option", "title", "Error");
                $("#infoDialog").html( "<p>" +  data.message + "</p>" );
                $("#infoDialog").dialog("open");                                                
                
                //Unlock the UI now that we are done
                $("#userName").attr("disabled",false);
                $("#verificationKey").attr("disabled",false);
                $("#masterPassword").attr("disabled",false);
                $("#masterPassword2").attr("disabled",false);
            }
        }
        
    </script>        
</body>
</html>

