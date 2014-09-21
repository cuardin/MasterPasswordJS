<?php

require_once ('./core/utilities.php');
require_once( './core/userManagementCore.php');


try {
    $mysql = connectDatabase();

    //Escape all the user input to be SQL safe.
    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $newPassword1 = getParameter($mysql, "newPassword1");
    $newPassword2 = getParameter($mysql, "newPassword2");

    if ( !authenticateUser($mysql, $username, $password)) {
        throw new Exception ( "Authentication failed" );
    }
    
    if ( strcmp( $newPassword1, $newPassword2 )) {
        throw new Exception ( "Two passwords did not match." );
    }
    
    changePassword($mysql, $username, $newPassword1);
    
    echo "<h1>OK</h1> Password changed successfully.";
} catch (Exception $e) {
    echo ( "<h1>FAIL</h1> " . $e->getMessage() );
}
?> 

