<?php

require_once(dirname(__FILE__).'/utilities.php');

function insertFile($mysql, $username, $fileName, $fileContents) {
    //First check if there is room for one more user
    if ( !checkRoomForOneMoreFile($mysql)) {
        throw new Exception( "DATABASE_FULL" );
    }
    
    $query = "INSERT INTO masterpassword_files (fileKey, username, fileName, fileContents )" .
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

function deleteFile($mysql, $username, $fileName) {    
    if ( !fileExists($mysql, $username, $fileName)) {
        return false;
    }
    $query = "DELETE FROM masterpassword_files WHERE username=? AND filename=?";
    $stmt = $mysql->prepare($query);
    if ($stmt) {
        $stmt->bind_param('ss', $username, $fileName);

        $stmt->execute();
        $stmt->close();
    } else {
        throw new Exception("FAIL: Statement creation failed.");        
    }
    return true;
}

function fileExists($mysql, $username, $filename) {
    $stmt = $mysql->prepare("SELECT * FROM masterpassword_files WHERE username=? AND filename=?");
    if (!$stmt) {
        throw new Exception("SQL Syntax error");
    }
    
    if (!$stmt->bind_param('ss', $username, $filename)) {
        throw new Exception("Error executing SQL statement");
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Error executing SQL statament");
    }
    
    if (!$stmt->store_result()) {
        throw new Exception("Error storing result");
    }            
    
    $num_rows = $stmt->num_rows;
    
    $stmt->free_result();
    
    $stmt->close();
    
    if ( $num_rows == 1 ) {
        return true;        
    } 
    if ( $num_rows == 0 ) {
        return false;
    }
    
    echo $num_rows;
    throw new Exception("More than one identical file found. This should not happen.");
}

function getNumberOfFilesBelongingToUser($mysql, $username) {
    $stmt = $mysql->prepare("SELECT * FROM masterpassword_files WHERE username=?" );
    if (!$stmt) {
        throw new Exception("SQL Syntax error");
    }
    if (!$stmt->bind_param('s', $username)) {
        throw new Exception("Error executing SQL statement");
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Error executing SQL statament");
    }    
    if (!$stmt->store_result()) {
        throw new Exception("Error storing results");
    }           
    
    $numRows = $stmt->num_rows;
    
    $stmt->free_result();
    
    $stmt->close();
    
    return $numRows;
}

function deleteAllFilesBelongingToUser($mysql, $username) {
    $query = "DELETE FROM masterpassword_files WHERE username=?";
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

function overwriteFile($mysql, $username, $filename, $fileContents) {
    $query = "UPDATE masterpassword_files SET fileContents=? WHERE username=? AND filename=?";
    //echo $query;
    try {
        $stmt = $mysql->prepare($query);
        if (!$stmt) {
            throw new Exception('Error preparing sql statement');
        }
        if (!$stmt->bind_param('sss', $fileContents, $username, $filename)) {
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

function getOneValueFromFileList($mysql, $field, $username, $filename) {
    if (preg_match('/[^a-z]/i', $field)) {
        return null;
    }
    $query = 'SELECT ' . $field . ' FROM masterpassword_files WHERE username=? AND filename=?';
    $stmt = $mysql->prepare($query);
    
    $value = ''; //Initialize
    if (!$stmt) {
        throw new Exception ( "SQL Syntax Error");
    }   
    if ( !$stmt->bind_param('ss', $username, $filename) ) {
        throw new Exception ( "Error binding parameter");
    }
    if ( !$stmt->execute() ) {
        throw new Exception( "Error executing SQL statement");
    }
    
    if ( !$stmt->store_result() ) {
        throw new Exception ( "Error storing result");
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
