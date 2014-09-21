<?php

require_once(dirname(__FILE__).'/utilities.php');

function insertFile($mysql, $username, $fileName, $fileContents) {
    $query = "INSERT INTO whiteboard_files (fileKey, username, fileName, fileContents )" .
            "VALUES ('null', ?, ?, ?)";

    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception("SQL syntax error");
        }
        if (!$stmt->bind_param('sss', $username, $fileName, $fileContents)) {
            throw new Exception("Error binding parameters");
        }
        if (!$stmt->execute()) {
            throw new Exception("Error executing statement");
        }
        if (!$stmt->close()) {
            throw new Exception("Error closing statement");
        }
    } catch (Exception $e) {
        throw new Exception(htmlspecialchars($mysql->error));
    }
    return $mysql->insert_id;
}

function deleteFile($mysql, $fileID) {
    $query = "DELETE FROM whiteboard_files WHERE fileKey=?";

    $stmt = $mysql->prepare($query);
    if ($stmt) {
        $stmt->bind_param('s', $fileID);

        $stmt->execute();
        $stmt->close();
    } else {
        echo 'FAIL: Statement creation failed.';
        return false;
    }
    return true;
}

function getNumberOfFilesBelongingToUser($mysql, $username) {
    $stmt = $mysql->prepare("SELECT * FROM whiteboard_files WHERE username=?");
    if (!$stmt) {
        throw new Exception("SQL Syntax error");
    }
    if (!$stmt->bind_param('s', $username)) {
        throw new Exception("Error executing SQL statement");
    }
    if (!$stmt->execute()) {
        throw new Exception("Error executing SQL statament");
    }
    $res = $stmt->get_result();
    if (!$res) {
        throw new Exception("No results found");
    }

    return $res->num_rows;
}

function deleteAllFilesBelongingToUser($mysql, $username) {
    $query = "DELETE FROM whiteboard_files WHERE username=?";
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

function overwriteFile($mysql, $fileID, $fileContents) {
    $query = "UPDATE whiteboard_files SET fileContents=? WHERE fileKey=?";
    //echo $query;
    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('ss', $fileContents, $fileID)) {
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

function getOneValueFromFileList($mysql, $field, $fileKey) {
    if (preg_match('/[^a-z]/i', $field)) {
        return null;
    }
    $query = 'SELECT ' . $field . ' FROM whiteboard_files WHERE fileKey=?';
    return getOneValueFromDataBase($mysql, $query, $fileKey);
}

function verifyOwnerOfFile($mysql, $username, $fileID) {

    $usernameStored = getOneValueFromFileList($mysql, 'username', $fileID);
    if (strcmp($usernameStored, $username)) {        
        return false;
    }

    return true;
}


?>
