<?php

require_once './core/utilities.php';

try {
    $mysql = connectDatabase();
    $username = getParameter($mysql,"username");
    $password = getParameter($mysql,"password");
    
    authenticateUser($mysql, $username, $password);
    echo "OK";
    
} catch ( Exception $e) {
    echo "FAIL: " . $e->getMessage();
}

?> 
