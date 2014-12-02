<?php
    //Redirect if we get called on http.    
    if(!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] == ""){
        $redirect = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
        header("Location: $redirect");        
    }   
?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>MasterPassword</title>
    <link href="jquery-ui.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">    	            
    <link href="styleFormSpecific.css" rel="stylesheet">    	            
    <meta name="apple-itunes-app" content="app-id=510296984" />
</head>
<body onbeforeunload="">    
    <div id="loaderDiv" class="mainDiv" style="text-align: center;">       
        <h1>Loading page</h1>        
        <img src="ajax-loader.gif">        
    </div>
    
    <div class="mainDiv" id="mainDiv" style="display: none;">        
        <small><p>BETA - This site is only tested in IE11, Firefox 33, and Chrome 38.</p>
            <p>Passwords are generated locally, your master password is not sent to any server. See the <a href="https://github.com/cuardin/MasterPasswordJS">source</a>.</p></small>
        <h1>MasterPassword</h1>                
        <form class="form"> 
            <div class="entry"> 
                <label for="userName">Username</label> 
                <input type="text" id="userName" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all" 
                       value="user02åäö"
                       title="Enter your standard user name. This is used to generate passwords and need not be the actual user name you use on any given site."/>   
            </div> 

            <div class="entry"> 
                <label for="masterPassword">Master Password</label> 
                <input type="password" id="masterPassword" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all" 
                       value="MasterPass01"
                       title="Enter your master password. All your other passwords can be found from this one, so make it good and keep it safe."/>             
            </div> 
            
            <div class="entry"> 
                <div id="progress" class="box"></div>                                
                <div id="loginStatus">
                <button id="createUser" type="button" title="Create a user so you can store sites online." style="display: none;">Create User</button>
                <div id="loginOK" style="display: none;"><img src="Ok-icon.png" width="32px" title="You are logged in. Although no passwords are sent to any server, you can now save sites with their settings to the central server to be accessed from anywhere."></div>
                </div>
            </div> 
            
            <div class="entry"> 
                <label for="siteName">Site</label>                                                 
                <input id="siteName" value="site01.åäö"
                       class="box ui-widget ui-widget-content ui-corner-all" 
                       title="Enter the name of the site for which you want a password. But it need not be a real site as any string will do." />
            </div> 

            <div class="entry"> 
                <label for="siteCounter">Site Counter</label> 
                <input id="siteCounter" min="1" value="1" class="box siteInput"
                       title="If a site informs you that you need to change your password due to a database leak, increase this number by one to get a completely fresh password for that site."/>             
            </div> 
            
            <div class="entry"> 
                <label for="siteType">Site Type</label> 
                <select id="siteType" class="box"
                        title="Choose the type of password you need for this site.">
                    <option value="maximum">Maximum</option>
                    <option value="long" selected>Long</option>
                    <option value="medium">Medium</option>
                    <option value="short">Short</option>
                    <option value="basic">Basic</option>
                    <option value="pin">Pin</option>
                </select> 
            </div> 

            <div class="entry"> 
                <label for="sitePassword">Site Password</label> 
                <input type="text"  id="sitePassword" 
                       class="box output ui-widget ui-widget-content ui-corner-all" 
                       readonly value="Expect: JacmYipw8,Nuji"
                       title="This is the password you can use for this site."/>                
                <button id="saveSite" type="button" title="Save this site. Requires a validated account.">+</button>
                <button id="deleteSite" type="button" title="Delete this site. Requires a validated account.">-</button>
                
            </div>             
        </form>
        <small class="validate">
            [<a href="passwordReset.php">Reset Password</a>] [<a href="http://www.gnu.org/copyleft/gpl.html">GPLv3</a>] [<a href="../test/mpwTest.html">Validate algorithm</a>]
        </small>
    </div>
    <div id="createUserDialog" title="Create new user" style="display: none;">                
        <label for="userName2">User Name again</label>
        <input id="userName2" type="text" class="popBox ui-widget ui-widget-content ui-corner-all"/>
        
        <label for="masterPassword2">Master Password again</label>
        <input id="masterPassword2" type="password" class="popBox ui-widget ui-widget-content ui-corner-all"/>
        
        <label for="email">Email</label>
        <input id="email" type="email" class="popBox ui-widget ui-widget-content ui-corner-all"/>
        
        <p></p>        
        
        <?php    
        echo "<script>\n";
        require_once( dirname(__FILE__).'/../database/core/utilitiesCore.php' );
        echo "</script>\n";
        $publicKey = getCAPCHAPublicKey();        
        echo "<script type='text/javascript' src='https://www.google.com/recaptcha/api/challenge?k=$publicKey'></script>"
        ?>
        <p></p>
        <img id="createUserSpinner" src="ajax-loader.gif" style="display: none;">

    </div>
    <div id="infoDialog" style="display: none;">                        
    </div>
    
    <!-- //For off-line mode, fill in these tags with the worker wrapper code.
    <script id="mpw_worker_wrapper" type="text/js-worker">       
    </script>
    
    <script id="database_worker_wrapper" type="text/js-worker">     
    </script>-->
    
    <script src="external/jquery/jquery.js"></script>
    <script src="jquery-ui.js"></script>
    <script src="../js/domWrapper.js"></script>
    <script src="../js/integration.js"></script>    
    <script src="../js/mpw_worker.js"></script> <!-- Maybe this helps with the reload -->
</body>
</html>

