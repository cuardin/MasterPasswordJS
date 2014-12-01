<?php

require_once ( './core/utilities.php' );
require_once( './core/fileManagementCore.php');
require_once( './core/userManagementCore.php');

init();

try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");    
    
    $authOK = false;
    if ( !authenticateUser($mysql, $username, $password)) {                
        throw new Exception ( "Authentication failed." );
    } else {
        deleteAllFilesBelongingToUser($mysql, $username );                
    }    
    
    echo "OK";
} catch ( Exception $e ) {    
    echo ( "FAIL" );
    echo ( $e->getMessage() );
}
?> 
