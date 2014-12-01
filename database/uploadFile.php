<?php

require_once ('./core/utilities.php');
require_once ('./core/fileManagementCore.php');

init();
        
try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $fileName = getParameter($mysql,"fileName");
    $fileContents = getParameter($mysql, "fileContents");    

    //Check that credentials are good.
    if (authenticateUser($mysql, $username, $password)) {        
        if ( fileExists($mysql, $username, $fileName) ) {            
            overwriteFile($mysql, $username, $fileName, $fileContents);
        } else {                        
            insertFile($mysql, $username, $fileName, $fileContents);
        }        
        echo "OK";                    
    } else {
        echo "FAIL: Authentication error";
    }
} catch ( Exception $e) {
    echo "FAIL: " . $e->getMessage();
}


?>
