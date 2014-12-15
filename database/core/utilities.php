<?php

require_once( dirname(__FILE__).'/utilitiesCore.php' );

function init() {
    header('Content-Type: text/html; charset=utf-8');
}

function rand_string($length) {
    /*$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    $size = strlen($chars);
    $str = '';
    for ($i = 0; $i < $length; $i++) {
        $str .= $chars[rand(0, $size - 1)];
    }*/    
    
    $str = openssl_random_pseudo_bytes($length);

    return $str;
}

function connectDatabase() {
    $username = getSQLUsername();
    $password = getSQLPassword();
    $databaseName = getSQLDBName();
    
    $mysql = new mysqli("localhost", $username, $password, $databaseName);
    if ($mysql->connect_errno) {
        echo ('FAIL: Could not connect: ' . $mysql->connect_error);
        return false;
    }
    $mysql->set_charset('utf8'); //Set the charset to utf-8
    return $mysql;
}

/**
* Verify a password against a hash using a timing attack resistant approach
* @return boolean If the password matches the hash
*/
function password_verify($password, $passwordStored) {
          
   $status = 0;
   for ($i = 0; $i < strlen($password); $i++) {
       $status |= (ord($password[$i]) ^ ord($passwordStored[$i]));
   }

   return $status === 0;
}

function authenticateUser($mysql, $username, $password) {

    //First get the password.    
    $passwordStored = getPasswordFromDatabase($mysql, $username);    
            
    //Hash the password, using the salt stored
    $passwordCrypt = crypt($password, $passwordStored);                         
    
    //error_log ( "$password" );
    //error_log ( "$passwordStored" );
    //error_log ( "$passwordCrypt" );
    
    //Now check the fetched password against the stored
    if (!password_verify($passwordStored, $passwordCrypt)) {                
        throw new Exception( "BAD_LOGIN" );
    }    
    
    return true;
}

function getPasswordFromDatabase($mysql, $username) {
    $query = 'SELECT password FROM masterpassword_users WHERE username=?';
    $stmt = $mysql->prepare($query);
    $value = ''; //Initialize
    if (!$stmt) {
        throw new Exception ( "SQL Syntax Error");
    }   
    if ( !$stmt->bind_param('s', $username) ) {
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
    
    if ( $value == '' ) {
        $value = $value."$6$000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    } else {
        $value = ''.$value;
    }
    return $value;
}

function getUserNameFromEmail($mysql, $email) {
    $query = 'SELECT username FROM masterpassword_users WHERE email=?';
    return getOneValueFromDataBase($mysql, $query, $email);
}

function getOneValueFromUserList($mysql, $field, $username) {
    if (preg_match('/[^a-z]/i', $field)) {
        throw new Exception( "Field name contained invalid characters." );
    }
    $query = 'SELECT ' . $field . ' FROM masterpassword_users WHERE username=?';    
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
    
    if ( $value == '' ) {
        $value = null;
    }
    return $value;
    
}


function getDateString() {
    return date(DATE_ISO8601);
}


function getParameter($paramName, $optional=false ) {        
    if ( array_key_exists($paramName, $_GET) ) {
        $rawValue = $_GET[$paramName];
    } else if ( array_key_exists($paramName, $_POST)) {        
        $rawValue = $_POST[$paramName];
    } else if ( !$optional ) {
        throw new Exception ( "Parameter requested was not provided: " . $paramName);
    } else {        
        return null;
    }
    //error_log("$paramName::$optional::$rawValue" );
    
    $rawValue = urldecode($rawValue);
    
    return $rawValue;
}

function checkUserEditKeyOrRECAPTCHA($isTest) {
    //Check if we have a recaptcha a user creation key
    $isHuman = false;        
    try {             
        $privateKeyProvided = getParameter("userEditKey");        
        if (!strcmp($privateKeyProvided, getUserEditKey()) && $isTest ) {           
            $isHuman = true;            
        } else {                        
            //error_log( "$privateKeyProvided::" . getUserEditKey() );
        }
    } catch (Exception $e) {
        //Do nothing.         
    }            
    
    if ( !$isHuman ) {
        $challenge = getParameter("recaptcha_challenge_field");
        $response = getParameter("recaptcha_response_field");        
        
        $privateCAPTHCAkey = getCAPCHAPrivateKey();                
        
        try {
            $resp = recaptcha_check_answer($privateCAPTHCAkey, $_SERVER["REMOTE_ADDR"], $challenge, $response);        
        } catch ( Exception $e ) {
            error_log( "reCAPCHA errored: " . $e->getMessage() );            
            throw new Exception( "reCAPCHA errored: " . $e->getMessage() );            
        }        
        
        if (!$resp->is_valid) {            
            $isHuman = false; //Still false.
        } else {            
            $isHuman = true;
        }       
    }    
    return $isHuman;
}

function getTotalRowsInTable($mysql, $table )
{
    $query = "SELECT COUNT(*) FROM $table";    
    $result = mysqli_query($mysql,$query);    
    $rows = mysqli_fetch_row($result);
    return $rows[0];
}

function checkRoomForOneMoreFile($mysql)
{
    return getTotalRowsInTable($mysql, "masterpassword_files") < getMaxNumberOfFiles();
}

function checkRoomForOneMoreUser($mysql)
{
    return getTotalRowsInTable($mysql, "masterpassword_users") < getMaxNumberOfUsers();
}
