<?php

require_once './core/utilities.php';
require_once './core/fileManagementCore.php';




try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $fileName = getParameter($mysql, "fileName");
    $fileContents = getParameter($mysql, "fileContents");

    //Check that credentials are good.
    if (authenticateUser($mysql, $username, $password)) {
        insertFile($mysql, $username, $fileName, $fileContents);
        echo "OK";
    } else {
        echo "FAIL: This should never happen";
    }
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage();
}
?>
