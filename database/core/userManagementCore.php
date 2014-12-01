<?php

function insertUser($mysql, $username, $password, $email) {    
    //TODO: This entire function has to be an atomic operation.
    
    //First check if there is room for one more user
    if ( !checkRoomForOneMoreUser($mysql)) {
        throw new Exception( "DATABASE_FULL" );
    }
    
    //Check if someone exists with the same email.
    if ( getUserNameFromEmail($mysql, $email) != null ) {
        return "DUPLICATE_USER";
    }    
    
    //Check if someone exists with the same user name
    if ( getOneValueFromUserList($mysql, "username", $username) != null ) {
        return "DUPLICATE_USER";
    }
    
    $passwordCrypt = crypt($password);
    $seed = "1";
    $query = "INSERT INTO masterpassword_users (username, password, seed, email)" .
            "VALUES (?, ?, ?, ?)";

    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('ssis', $username, $passwordCrypt, $seed, $email)) {
            throw new Exception('Error binding parameters');
        }
        if (!$stmt->execute()) {
            throw new Exception('Error executing statement');
        }
        if (!$stmt->close()) {
            throw new Exception('Error closing statement');
        }
               
        return "OK";                
        
    } catch (Exception $e) {        
        throw new Exception(htmlspecialchars($mysql->error));
    }
}

function deleteUser($mysql, $username) {
    $query = "DELETE FROM masterpassword_users WHERE username=?";
    //echo $query . "<br/>";
    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('s', $username)) {
            throw new Exception('Error binding parameters');
        }
        if (!$stmt->execute()) {
            throw new Exception('Error executing statement');
        }
        if (!$stmt->close()) {
            throw new Exception('Error closing statement');
        }
    } catch (Exception $e) {
        //echo $e->getMessage() . "<br/>";
        throw new Exception(htmlspecialchars($mysql->error));
    }
}

function clearValidationData( $mysql, $username ) {
    $query = "UPDATE masterpassword_users SET verificationKey='0',verificationKeyExpiration=NULL WHERE username=?";
    //echo $query . "<br/>";
    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('s', $username)) {
            throw new Exception('Error binding parameters');
        }
        if (!$stmt->execute()) {
            throw new Exception('Error executing statement');
        }
        if (!$stmt->close()) {
            throw new Exception('Error closing statement');
        }
    } catch (Exception $e) {
        //echo $e->getMessage() . "<br/>";
        throw new Exception(htmlspecialchars($mysql->error));
    }
}

function deleteUserWithKey($mysql, $username, $password, $privateKey) {    
    if (!strcmp($privateKey, getUserEditKey()) || authenticateUser($mysql, $username, $password)) {
        deleteUser($mysql, $username);
    } else {
        throw new Exception("Authentication failed");
    }
}

function setPassword( $mysql, $userName, $newPassword ) {
    
    $newPassword = crypt($newPassword);
    
    $query = "UPDATE masterpassword_users SET password=? WHERE userName=?";
    //echo $query . "<br/>";
    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('ss', $newPassword, $userName)) {
            throw new Exception('Error binding parameters');
        }
        if (!$stmt->execute()) {
            throw new Exception('Error executing statement');
        }
        if (!$stmt->close()) {
            throw new Exception('Error closing statement');
        }
    } catch (Exception $e) {
        //echo $e->getMessage() . "<br/>";
        throw new Exception(htmlspecialchars($mysql->error));
    }
}
function validateUserWithKey($mysql, $username, $verificationKey, $newPassword) {
    $verificationKeyStored = getOneValueFromUserList($mysql, 'verificationKey', $username);
    $verificationKeyExpiration = getOneValueFromUserList($mysql, "verificationKeyExpiration", $username);                    
    
    clearValidationData($mysql, $username );
    
    if (strcmp($verificationKeyStored, $verificationKey)) {        
        return "BAD_VERIFICATION_KEY";
    }
        
    $timeInDb = strtotime($verificationKeyExpiration);
    $timeNow = time();
    $timeIn15Min = time()+15*60;
    if ( $timeInDb < $timeNow || $timeInDb > $timeIn15Min ){                
        return "BAD_VERIFICATION_KEY";
    }
    
    setPassword( $mysql, $username, $newPassword );    
    
    return "OK";
}

function resetPassword($mysql, $username, $verificationKey) {    
    $timeIn15Minutes = date("Y-m-d H:i:s", time() + 15*60 );
    
    try {        
        $query = "UPDATE masterpassword_users SET verificationKey=?,verificationKeyExpiration=? WHERE username=?";
        
        $stmt = $mysql->prepare($query);

        if (!$stmt) {
            throw new Exception();
        }

        if (!$stmt->bind_param('sss', $verificationKey, $timeIn15Minutes, $username)) {
            throw new Exception();
        }

        if (!$stmt->execute()) {
            throw new Exception();
        }
        if (!$stmt->close()) {
            throw new Exception();
        }
    } catch (Exception $e) {
        throw new Exception(
        "Error resetting password: " . htmlspecialchars($mysql->error) );
    }
}


?>
