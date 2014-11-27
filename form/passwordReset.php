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
        
        <h1>Set new password</h1>
        <form>
            <p>
                <label for="userName">Username</label>
                <input type="text" id="userName" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="user02åäö">
            </p>
            
            <p>
                <label for="verificationKey">Reset Key</label>
                <input type="text" id="verificationKey" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="34239048230984">
            </p>
            
            <p>
                <label for="masterPassword">New master password</label>
                <input type="password" id="masterPassword" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="NewPass01">
            </p>
            
            <p>
                <label for="masterPassword1">New master password again</label>
                <input type="password" id="masterPassword2" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all"
                       value="NewPass01">
            </p>
            
            <button id="submitNewPass" type="button">Submit</button>
            
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
            /*
            if ( typeof(Recaptcha) === "undefined" ) {
                console.log("Recapcha wasn't defined. Exiting.");
                setMainDiv("Sorry, recapcha has failed.");                        
                return;
            }*/
            
            $( "#submitReset").button();
            
            $( "#submitNewPass").button();
            
            //Finally, we swap out the loading code and swap in the real content.
            $("#loaderDiv").attr( "style", "display: none;" );
            $("#mainDiv").attr( "style", "" );
        });
        
        $("#submitReset").click( submitReset );    
        function submitReset() {
           var data = {};
            data.command = "resetPassword";    
            data.email = $('#email').val();
            data.capchaChallenge = $('#recaptcha_challenge_field').val();
            data.capchaResponse = $('#recaptcha_response_field').val();            
            dbWorker.postMessage(JSON.stringify(data)); 
        }
        
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
        }
        
        function passWorkerEventHandler(event) {
            var data = JSON.parse(event.data);    
            console.log(data);
            
            if ( data.type === "masterKey" ) {                       
                //TODO: Add a progress bar for this.
                var data = {};
                data.command = "getDbPassword";    
                w.postMessage(JSON.stringify(data));
            } else if ( data.type === "dbPassword" ) {                        
                var dbPassword = data.data;
                var data = {};
                data.command = "setNewPassword";    
                data.userName = $('#userName').val();
                data.dbPassword = dbPassword;
                data.verificationKey = $('#verificationKey').val();
                dbWorker.postMessage(JSON.stringify(data));            
            } else if ( data.type === "passwordReset" ) {                        
                //Do something
            }
        }
        
    </script>        
</body>
</html>

