<?php

require_once( './core/fileManagementCore.php' );
require_once( './core/utilities.php' );


try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    $fileID = getParameter($mysql, "fileID");

    if (authenticateUser($mysql, $username, $password)) {
        if (verifyOwnerOfFile($mysql, $username, $fileID)) {
            $fileData = getOneValueFromFileList($mysql, 'fileContents', $fileID);
            if ($fileData == null) {
                echo "FAIL: No file data returned.";
            } else if (!base64_decode($fileData, true)) {
                echo "FAIL: Value in database is not Base64 encoded. This is very serious.";
            } else {
                echo $fileData;
            }
        } else {
            echo "FAIL: Wrong owner of file";
        }
    } else {
        echo "FAIL: Authnetication failed";
    }
} catch (Exception $e) {
    echo ( "FAIL: " . $e->getMessage() );
}
?>
