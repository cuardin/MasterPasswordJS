<?php

require_once ('./core/utilities.php');
require_once ('./core/fileManagementCore.php');

init();

try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $filename = getParameter($mysql, "fileName");

    if ( authenticateUser($mysql, $username, $password)) {        
        if ( deleteFile($mysql, $username, $filename)) {
            echo "OK";
        } else {
            echo "FAIL: Error deleting file";
        }        
    } else {
        echo "FAIL: Authentication failed";
    }   
} catch ( Exception $e ) {
    echo "FAIL: " . $e->getMessage();
}

?>
