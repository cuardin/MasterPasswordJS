<?php

require_once ('./core/utilities.php');
require_once ('./core/fileManagementCore.php');


        
try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $fileID = getParameter($mysql,"fileID");
    $fileContents = getParameter($mysql, "fileContents");

    //Check that credentials are good.
    if (authenticateUser($mysql, $username, $password)) {
        if ( verifyOwnerOfFile($mysql, $username, $fileID ))  {
            overwriteFile($mysql,$fileID,$fileContents);
            echo "OK";            
        } else {
            echo "FAIL: Wrong owner of file";
        }
    } else {
        echo "FAIL: Authentication error";
    }
} catch ( Exception $e) {
    echo "FAIL: " . $e->getMessage();
}


?>
