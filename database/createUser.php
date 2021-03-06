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
    $username = getParameter("username");
    $email = getParameter("email");
    $password = getParameter("password");        
    
        
    $testParam = getParameter("test",true);    
    if ( !strcmp( $testParam, "true") ) {
        $isTest = 1;
    }  else {
        $isTest = 0;
    }            
    
    error_log( $isTest );
    
    if ( $isTest ) {
        $mailer = new MailerStub();
    } else {
        $mailer = new Mailer();
    }
    
    $rValue = checkUserEditKeyOrRECAPTCHA($isTest);
    
    if ( !$rValue ) {
        echo "INVALID_CAPCHA";
        return;
    }
    
    $message = insertUser($mysql, $username, $password, $email, $isTest);    
    echo $message;
    

} catch (Exception $e) {
    echo ( "FAIL: " . $e->getMessage() );
}
?> 

