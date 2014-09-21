<?php

require_once ( './core/utilities.php' );



try {
    $mysql = connectDatabase();
    
    $username = getParameter($mysql, "username");
    $verificationOK = false;
    
    //First try verification key
    try {
        $verificationKey = getParameter($mysql, "verificationKey");
        $verificationKeyStored = getOneValueFromUserList($mysql, 'verificationKey', $username);

        //Now check the fetched verification key against the stored
        if (!strcmp($verificationKeyStored, $verificationKey)) {
            $verificationOK = true;
        }
    } catch ( Exception $e ) {
        //Do nothing.        
    }
    
    //Now try the private key
    try {
        $privateKey = getparameter( $mysql, "privateKey" );
        //Now check the fetched private key against the stored
        if (!strcmp($privateKey, getPrivateKey())) {
            $verificationOK = true;
        }
    } catch ( Exception $e ) {
        //Do nothing.
    }
    
    if ( !$verificationOK ) {
        throw new Exception( "Verification key did not match stored, personal or secret." );
    }
    
    $stmt = $mysql->prepare("UPDATE whiteboard_users SET verificationKey='0' WHERE username=?");
    if ( !$stmt ) {
        throw new Exception( "Error preparing SLQ statement" );
    }
    if ( !$stmt->bind_param('s', $username) ) {
        throw new Exception ( "Error binding parameter" );
    }
    if ( !$stmt->execute() ) {
        throw new Exception ( "Error executing SQL statement" );
    }
    
    echo "<h1>OK</h1>";
} catch ( Exception $e ) {    
    echo ( "<h1>FAIL</h1>" );
    echo ( $e->getMessage() );
}
?> 
