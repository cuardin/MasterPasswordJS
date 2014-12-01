<?php

require_once ('./core/utilities.php');

init();
header('Content-Type: application/json');

try {    
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");

    //Check that credentials are good.
    if (authenticateUser($mysql, $username, $password)) {
        
        //And list the files
        $stmt = $mysql->prepare("SELECT fileName,fileContents FROM masterpassword_files WHERE username=?");
        if ( !$stmt ) {
            throw new Exception ("Error preparing statement");
        }
        
        if ( !$stmt->bind_param('s', $username) ) {
            throw new Exception("Error binding variables");
        }
        
        if ( !$stmt->execute() ) {
            throw new Exception("Error executing statement");
        }
        
        if ( !$stmt->store_result() ) {
            throw new Exception("Error executing statement");
        }
                                        
        $stmt->bind_result($fileName, $fileContents );
        
        $data = array();

        while ( $stmt->fetch() ) {            
            $data[$fileName] = $fileContents;            
        }               
        
                
        print(json_encode($data));
    }
} catch ( Exception $e )  {    
    echo "FAIL: " . $e->getMessage();
}
?>
