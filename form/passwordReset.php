<?php
    //Redirect if we get called on http.    
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ""){
        $redirect = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        header("Location: $redirect");        
    }   
    echo "<!--";
    require_once( dirname(__FILE__).'/../js/utilitiesSecret.php' );
    echo "-->";
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
        <h1>Request password reset key</h1>
        <form>
            <p>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" value="daniel23@armyr.se" class="mainInput box ui-widget ui-widget-content ui-corner-all">
            </p>
            <p>
                <?php                
                $publicKey = getCAPCHAPublicKey();        
                echo "  <script type='text/javascript' src='https://www.google.com/recaptcha/api/challenge?k=$publicKey'></script>"
                ?> 
            </p>
            <input type="button" value="Submit" id="submitReset">                        
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
            
            if ( typeof(Recaptcha) === "undefined" ) {
                console.log("Recapcha wasn't defined. Exiting.");
                setMainDiv("Sorry, recapcha has failed.");                        
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
            
            $( "#submitReset").button();                        
            
            //Finally, we swap out the loading code and swap in the real content.
            $("#loaderDiv").attr( "style", "display: none;" );
            $("#mainDiv").attr( "style", "" );
        });
        
        $("#submitReset").click( submitReset );    
        function submitReset() {
            //First replace the form with the loader icon.
            $("#loaderDiv").attr( "style", "" );
            $("#mainDiv").attr( "style", "display: none;" );
            
            var data = {};
            data.command = "resetPassword";    
            data.email = $('#email').val();
            data.capchaChallenge = $('#recaptcha_challenge_field').val();
            data.capchaResponse = $('#recaptcha_response_field').val();                                    
            dbWorker.postMessage(JSON.stringify(data)); 
            
            //Now make sure the captcha is reloaded
            Recaptcha.reload(); 
        }
                
        function passWorkerEventHandler(event) {
            var data = JSON.parse(event.data);    
            console.log(data);
                        
            if ( data.type === "passwordReset" ) {                         
                $("#infoDialog").dialog("option", "title", "OK");
                $("#infoDialog").html( "<p> Pasword request successful. Check your inbox.</p>" );
                $("#infoDialog").dialog("open");
                
                $("#loaderDiv").attr( "style", "display: none;" );
                $("#mainDiv").attr( "style", "" );
            } else {
                $("#infoDialog").dialog("option", "title", "Error");
                $("#infoDialog").html( "<p>" +  data.message + "</p>" );
                $("#infoDialog").dialog("open");                
                
                $("#loaderDiv").attr( "style", "display: none;" );
                $("#mainDiv").attr( "style", "" );
            }
        }
        
    </script>        
</body>
</html>

