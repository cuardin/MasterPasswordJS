<?php

function connectDatabase() {
    $mysql = new mysqli("localhost", "armyr_se", "zDVMcwu5", "armyr_se");
    if ($mysql->connect_errno) {
        echo ('FAIL: Could not connect: ' . $mysql->connect_error);
        return false;
    }
    return $mysql;
}

function getPrivateKey() {
    return "OPIERKLMNCGAEIFKAJSDANSD";
}

function getCAPTHCAKey() {
    return "6LdI69gSAAAAAMGDL9POtz8ackomTjVz3jnwXRKC";
}

?>
