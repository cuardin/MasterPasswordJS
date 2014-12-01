<?php

require_once ('./core/utilities.php');
require_once ('./core/fileManagementCore.php');

init();

try {
    $mysql = connectDatabase();

    $username = getParameter("username");
    $password = getParameter("password");
    $filename = getParameter("fileName");

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
