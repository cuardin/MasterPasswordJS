<?php

require_once ( './core/utilities.php' );
require_once ( './core/userManagementCore.php' );
require_once ( './core/recaptchalib.php' );
require_once ( './core/Mailer.php' );
require_once ( './test/MailerStub.php' );

init();

try {
    $mysql = connectDatabase();        
    
    //error_log( $_SERVER['QUERY_STRING']);
    
    //Escape all the user input to be SQL safe.
    $username = getParameter($mysql, "username");
    $email = getParameter($mysql, "email");
    $password = getParameter($mysql, "password");        
    
    $mailer = new Mailer();
    try {
        $isTest = getParameter($mysql, "test");
        if ( !strcmp($isTest, 'true') ) {
            $mailer = new MailerStub();
        }
    } catch ( Exception $e ) {
        
    }   
        
    $rValue = checkUserEditKeyOrRECAPTCHA($mysql);
    
    if ( !$rValue ) {
        echo "INVALID_CAPCHA";
        return;
    }
    
    $message = insertUser($mysql, $username, $password, $email);    
    echo $message;
    

} catch (Exception $e) {
    echo ( "FAIL: " . $e->getMessage() );
}
?> 

