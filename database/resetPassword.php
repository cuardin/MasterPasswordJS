<?php

require_once './core/utilities.php';
require_once ( './core/userManagementCore.php' );
require_once ( './core/recaptchalib.php' );
require_once ( './core/Mailer.php' );
require_once ( './test/MailerStub.php' );

init();

try {
    //error_log( $_SERVER['QUERY_STRING'] );
    
    $mysql = connectDatabase();
    $email = getParameter($mysql,"email");    
    //echo "Email: " . $email . "<br/>";
    //echo "User name: " . getUserNameFromEmail($mysql, $email) . "<br/>";
    
    $mailer = new Mailer();
    /*try {
        $isTest = getParameter($mysql, "test");
        if ( !strcmp($isTest, 'true') ) {
            error_log( "Using stub mailer." );
            $mailer = new MailerStub();
        }
    } catch ( Exception $e ) {
        
    } */  
    
    if ( !checkUserEditKeyOrRECAPTCHA($mysql) ) {                
        echo "INVALID_CAPTCHA";
        return;
    }
    
    $verificationKey = rand_string(32);    
    $username = getUserNameFromEmail($mysql, $email);
    resetPassword($mysql, $username, $verificationKey );    
    
    sendPasswordResetEmail($email,$mailer,$username,$verificationKey);
    
    echo "OK";
                                    
} catch ( Exception $e) {    
    echo "FAIL: " . $e->getMessage();
}

function sendPasswordResetEmail($email,$mailer,$username,$verificationKey)
{    

    $subject = '[MasterPassword] Password Change Request';

    $headers = "From: masterpassword@armyr.se\r\n";        
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
    $usernameCode = urlencode($username);
    
    $url = getBaseURL() . "../java_script/form/setNewPassword.php?verificationKey=$verificationKey&username=$usernameCode"; 
    error_log( $url );
    
    $message = '<html>'            
            . '<body>'
            . '<h1>Password change request</h1>'
            . '<p>A password request has been made for your account. If you '
            . 'did not make it, you can ignore this message.</p>'
            . '<p>To change your password, click the following link:</p>'
            . '<p><a href="' .$url . '">' . $url .'</a>'                                
            . '</body></html>';
                
    
    $mailer->sendEmail(  $email, $subject, $message, $headers );
}
