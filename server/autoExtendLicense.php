<?php

include './core/utilities.php';


try {
    $mysql = connectDatabase();

    $email = getParameter($mysql, "email");
    $type = getParameter($mysql, "type");

    if ( autoExtendLicense($mysql, $email, $type) ) {
        echo "OK";
    } 
} catch ( Exception $e ) {
    echo "FAIL: ";
    echo $e->getMessage();
}

?>
