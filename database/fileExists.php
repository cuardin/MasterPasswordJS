<?php

require_once( './core/fileManagementCore.php' );
require_once( './core/utilities.php' );

init();

try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $filename = getParameter($mysql, "fileName");

    if (authenticateUser($mysql, $username, $password)) {        
        if (fileExists($mysql, $username, $filename)) {
            echo "OK: true";
        } else {
            echo "OK: false";
        }
    } else {
        echo "FAIL: Authnetication failed";
    }
} catch (Exception $e) {
    echo ( "FAIL: " . $e->getMessage() );
}
?>
