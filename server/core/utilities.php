<?php

require_once( dirname(__FILE__).'/utilitiesSecret.php' );

function rand_string($length) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    $size = strlen($chars);
    for ($i = 0; $i < $length; $i++) {
        $str .= $chars[rand(0, $size - 1)];
    }

    return $str;
}

function authenticateUser($mysql, $username, $password) {

    //First check if the user name exists
    //This introduces a security concern in that the list of user names can 
    //be leaked, but I do not care.
    $usernameStored = getOneValueFromUserList($mysql, "username", $username);
    if ( strcmp( $username, $usernameStored) ) {
        throw new Exception ( "Unknown user name");
    }
    
    //Second check that the email has been verified.
    $verificationKey = getOneValueFromUserList($mysql, "verificationKey", $username);
    if (strcmp($verificationKey, '0')) {
        throw new Exception ( "User not validated" );        
    }

    //Then get the password. This setup allows a hacker to do a timing attach 
    //and find the list of usernames in the database. Ignoring that for now.
    $passwordStored = getOneValueFromUserList($mysql, "password", $username);  
    
    //Hash the password, using the salt stored
    $passwordCrypt = crypt($password, $passwordStored);          
    
    //Now check the fetched password against the stored
    if (strcmp($passwordStored, $passwordCrypt)) {
        throw new Exception( "Wrong password" );
     }

    //Finally, check that we have not expired
    $expirationDateString =
            getOneValueFromUserList($mysql, "expirationDate", $username);
    $expirationDate = strtotime($expirationDateString);
    $currentDate = strtotime(getDateString());

    if ($expirationDate < $currentDate) {
        //echo ( 'FAIL: Account expired on ' . $expirationDateString . '.' );
        throw new Exception( "License expired" );
    }

    return true;
}

function getUserNameFromEmail($mysql, $email) {
    $query = 'SELECT username FROM whiteboard_users WHERE email=?';
    return getOneValueFromDataBase($mysql, $query, $email);
}

function getOneValueFromUserList($mysql, $field, $username) {
    if (preg_match('/[^a-z]/i', $field)) {
        return null;
    }
    $query = 'SELECT ' . $field . ' FROM whiteboard_users WHERE username=?';    
    return getOneValueFromDataBase($mysql, $query, $username);
}

function getOneValueFromDataBase($mysql, $query, $variable) {
    $stmt = $mysql->prepare($query);
    $value = ''; //Initialize
    if (!$stmt) {
        throw new Exception ( "SQL Syntax Error");
    }   
    if ( !$stmt->bind_param('s', $variable) ) {
        throw new Exception ( "Error binding parameter");
    }
    if ( !$stmt->execute() ) {
        throw new Exception( "Error executing SQL statement");
    }
    if ( !$stmt->bind_result($value) ) {
        throw new Exception ( "Error binding result");
    }    
    if ( $stmt->fetch() === false ) {
        throw new Exception ( "Error fetching data" );
    }    
    if ( !$stmt->close() ) {
        throw new Exception( "Error closing statemebt");
    }
    
    return $value;
    
}


function getDateString() {
    return date(DATE_ISO8601);
}


function getParameter($mysql, $paramName) {
    if ( !array_key_exists($paramName, $_GET) && !array_key_exists($paramName, $_POST)) {
        throw new Exception ( "Parameter requested was not provided: " . $paramName);
    }
    $rawValue = $_GET[$paramName];
    if (!strcmp($rawValue, "")) {
        $rawValue = $_POST[$paramName];
    }    
    return $mysql->real_escape_string($rawValue);
}


?>
