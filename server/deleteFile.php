<?php

require_once ('./core/utilities.php');
require_once ('./core/fileManagementCore.php');

try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $fileID = getParameter($mysql, "fileID");

    if ( authenticateUser($mysql, $username, $password)) {
        if ( verifyOwnerOfFile($mysql, $username, $fileID )) {
            if ( deleteFile($mysql, $fileID)) {
                echo "OK";
            } else {
                echo "FAIL: Error deleting file";
            }
        } else {
            echo "FAIL: Wrong owner of file";
        }
    } else {
        echo "FAIL: Authentication failed";
    }   
} catch ( Exception $e ) {
    echo "FAIL: " . $e->getMessage();
}

?>
