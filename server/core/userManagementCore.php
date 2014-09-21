<?php

require_once( dirname(__FILE__)."/licenseManagementCore.php");

function insertUser($mysql, $username, $password, $verificationKey, $email) {
    $passwordCrypt = crypt($password);

    $query = "INSERT INTO whiteboard_users (username, password, verificationKey, email)" .
            "VALUES (?, ?, ?, ?)";

    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('ssss', $username, $passwordCrypt, $verificationKey, $email)) {
            throw new Exception('Error binding parameters');
        }
        if (!$stmt->execute()) {
            throw new Exception('Error executing statement');
        }
        if (!$stmt->close()) {
            throw new Exception('Error closing statement');
        }

        if (!autoExtendLicense($mysql, $email, 'NEW')) {
            //echo "Extending license. <br/>";
            throw new Exception("Error extending license");
        }
        
        return mysqli_insert_id($mysql);        
        
    } catch (Exception $e) {
        //echo $e->getMessage() . "<br/>";
        throw new Exception(htmlspecialchars($mysql->error));
    }
}

function deleteUser($mysql, $username) {
    $query = "DELETE FROM whiteboard_users WHERE username=?";
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

function validateUser($mysql, $username) {
    $query = "UPDATE whiteboard_users SET verificationKey='0' WHERE username=?";
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
    if (!strcmp($privateKey, getPrivateKey())) {
        deleteUser($mysql, $username);
    } else {
        throw new Exception("Authentication failed");
    }
}

function validateUserWithKey($mysql, $username, $verificationKey) {
    $verificationKeyStored = getOneValueFromUserList($mysql, 'verificationKey', $username);
    if (strcmp($verificationKeyStored, $verificationKey)) {
        throw new Exception("Key provided did not match stored key");
    }
    validateUser($mysql, $username);
}

function changePassword($mysql, $username, $password) {
    $password = crypt($password);
    
    try {
        $query = "UPDATE whiteboard_users SET password=? WHERE username=?";

        $stmt = $mysql->prepare($query);

        if (!$stmt) {
            throw new Exception();
        }

        if (!$stmt->bind_param('ss', $password, $username)) {
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
