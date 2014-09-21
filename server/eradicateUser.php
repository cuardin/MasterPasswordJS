<?php

require_once ( './core/utilities.php' );
require_once( './core/fileManagementCore.php');
require_once( './core/bugReportCore.php');
require_once( './core/userManagementCore.php');

try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $privateKey = getParameter($mysql, "privateKey");
    
    if ( !authenticateUser($mysql, $username, $password)) {
        throw new Exception ( "Authentication failed." );
    }
    
    if ( strcmp( $privateKey, getPrivateKey() )) {
        throw new Exception ( "Extended authentication failed." );
    }
    
    deleteAllFilesBelongingToUser($mysql, $username );        
    doDeleteAllReportsBelongingToUser( $mysql, $username );
    deleteUser( $mysql, $username );
    
    echo "OK";
} catch ( Exception $e ) {    
    echo ( "FAIL" );
    echo ( $e->getMessage() );
}
?> 
