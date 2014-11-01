<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>MasterPassword</title>
    <link href="jquery-ui.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">    	
    <style>
        .ui-dialog-titlebar-close {
            display: none;
        }        
    </style>
</head>
<body onbeforeunload="">    

    <div class="mainDiv" id="mainDiv">        
        <h1>MasterPassword</h1>
        <p style="color: red">WARNING: This page uses unverified java&shy;script that may leak data and does not hide your master password. Do not enter any of your real passwords.</p>
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
                <input type="text" id="masterPassword" 
                       class="mainInput box ui-widget ui-widget-content ui-corner-all" 
                       value="MasterPass01"
                       title="Enter your master password. All your other passwords can be found from this one, so make it good and keep it safe."/>             
            </div> 
            
            <div class="entry"> 
                <div id="progress" class="box"></div>                                
                <div id="loginStatus">
                <button id="createUser" type="button" title="Create a user so you can store sites online." style="display: none;">Create User</button>
                <div id="loginOK" style="display: none;">Login OK</div>
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
            <a href="../test/mpwTest.html">Validate algorithm</a>
        </small>
    </div>
    <div id="createUserDialog" title="Create new user" style="display: none;">                
        <label for="userName2">User Name again</label>
        <input id="userName2" class="popBox ui-widget ui-widget-content ui-corner-all"/>
        
        <label for="masterPassword2">Master Password again</label>
        <input id="masterPassword2" class="popBox ui-widget ui-widget-content ui-corner-all"/>
        
        <label for="email">Email</label>
        <input id="email" type="email" class="popBox ui-widget ui-widget-content ui-corner-all"/>
               
        <?php    
        echo "<script>\n";
        require_once( dirname(__FILE__).'/../js/utilitiesSecret.php' );
        echo "</script>\n";
        $publicKey = getCAPCHAPublicKey();        
        echo "<script type='text/javascript' src='https://www.google.com/recaptcha/api/challenge?k=$publicKey'></script>"
        ?>

    </div>
    <div id="infoDialog" style="display: none;">                        
    </div>
</body>

<script src="external/jquery/jquery.js"></script>
<script src="jquery-ui.js"></script>
<script src="../js/domWrapper.js"></script>
<script src="../js/integration.js"></script>
</html>

