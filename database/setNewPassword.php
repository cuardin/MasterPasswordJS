<?php

require_once ( './core/utilities.php' );
require_once ( './core/userManagementCore.php' );

init();

try {
    //error_log( $_SERVER['QUERY_STRING'] );
    
    $mysql = connectDatabase();
    $username = getParameter("username");        
    $verificationKey = getParameter("verificationKey");        
    $newPassword = getParameter("newPassword");        
                        
    $rValue = validateUserWithKey($mysql, $username, $verificationKey, $newPassword );
            
    echo $rValue;
    
} catch ( Exception $e) {    
    echo "FAIL: " . $e->getMessage();
}

