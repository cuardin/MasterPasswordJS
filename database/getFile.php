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
            $fileData = getOneValueFromFileList($mysql, 'fileContents', $username, $filename);
            if ($fileData == null) {
                echo "FAIL: No file data returned.";
            } else if (!base64_decode($fileData, true)) {
                echo "FAIL: Value in database is not Base64 encoded. This is very serious.";
            } else {
                echo "OK: $fileData";
            }        
    } else {
        echo "FAIL: Authnetication failed";
    }
} catch (Exception $e) {
    echo ( "FAIL: " . $e->getMessage() );
}
?>
