<?php

require_once ( './core/utilities.php' );
require_once ( './core/userManagementCore.php' );
require_once ( './core/recaptchalib.php' );


try {
    $mysql = connectDatabase();

    //Escape all the user input to be SQL safe.    
    echo getParameter($mysql, "username");
    
} catch ( Exception $e ) {
    echo "<h1>FAIL</h1>";
    echo $e->getMessage();
}

?> 

