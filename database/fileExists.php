<?php

require_once( './core/fileManagementCore.php' );
require_once( './core/utilities.php' );

init();

try {
    $mysql = connectDatabase();

    $username = getParameter("username");
    $password = getParameter("password");
    $filename = getParameter("fileName");

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
