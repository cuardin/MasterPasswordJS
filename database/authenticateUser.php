<?php

require_once './core/utilities.php';

init();

try {
    $mysql = connectDatabase();
    $username = getParameter("username");
    $password = getParameter("password");    
    authenticateUser($mysql, $username, $password);    
    
    echo "OK";
    
} catch ( Exception $e) {    
    echo "FAIL: " . $e->getMessage();
}

?> 
