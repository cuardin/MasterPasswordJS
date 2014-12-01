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
        $authOK = true;
    }
    
    if ( !$authOK ) {
        $privateKey = getParameter($mysql, "userEditKey");
        if ( strcmp( $privateKey, getUserEditKey() )) {
            throw new Exception ( "Extended authentication failed." );
        } 
    }
        
    deleteAllFilesBelongingToUser($mysql, $username );            
    deleteUser( $mysql, $username );
    
    echo "OK";
} catch ( Exception $e ) {    
    echo ( "FAIL" );
    echo ( $e->getMessage() );
}
?> 
