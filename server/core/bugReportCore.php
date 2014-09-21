<?php
require_once(dirname(__FILE__).'/utilities.php');

function submitReport($mysql, $username, $description, $reproduction, 
        $stacktrace, $state ) {
    $query = "INSERT INTO whiteboard_reports (username, description, " .
        "reproduction, stacktrace, state )" .
            "VALUES (?, ?, ?, ?, ?)";

    try {
        $stmt = $mysql->prepare($query);
    
        if (!$stmt) {
            throw new Exception();
        }
    
        if ( !$stmt->bind_param('sssss', $username, $description, 
                $reproduction, $stacktrace, $state) ) {
            throw new Exception();
        }
        
        if ( !$stmt->execute() ) {
            throw new Exception();
        }
        if ( !$stmt->close() ) {
            throw new Exception();
        }
            
        return mysqli_insert_id($mysql);        
    }catch ( Exception $e) {
        echo 'FAIL: '; 
        echo htmlspecialchars($mysql->error);
        return false;
    }
}

function doDeleteAllReportsBelongingToUser($mysql, $username) {
    $query = "DELETE FROM whiteboard_reports WHERE username=?";
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

function getOneValueFromReportList($mysql, $field, $fileKey) {
    if (preg_match('/[^a-z]/i', $field)) {
        return null;
    }
    $query = 'SELECT ' . $field . ' FROM whiteboard_reports WHERE reportID=?';
    return getOneValueFromDataBase($mysql, $query, $fileKey);
}

function getNumberOfReportsBelongingTo( $mysql, $username )
{    
    $stmt = $mysql->prepare("SELECT * FROM whiteboard_reports WHERE username=?");
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
?>
