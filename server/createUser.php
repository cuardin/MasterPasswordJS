<?php

require_once ( './core/utilities.php' );
require_once ( './core/userManagementCore.php' );
require_once ( './core/recaptchalib.php' );



try {
    $mysql = connectDatabase();

    $verificationKey = rand_string(32);

    //Escape all the user input to be SQL safe.
    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password1");
    $password2 = getParameter($mysql, "password2");
    $email = getParameter($mysql, "email");

    $userNameStored = getOneValueFromUserList($mysql, 'username', $username);
    if (!($userNameStored == null)) {
        throw new Exception('User name allready exists: ' . $userNameStored);
    }
    
    if ( strcmp( $password, $password2 ) ) {
        throw new Exception ( "Passwords do not match." );
    } 
    
    //Check if we have a recaptcha or a private key
    $isHuman = false;
    try {
        $privateKeyProvided = getParameter($mysql, "privateKey");        
        if (!strcmp($privateKeyProvided, getPrivateKey())) {
            $isHuman = true;
        }
    } catch (Exception $e) {
        //Do nothing.
    }

    if (!$isHuman) {
        // RECAPTCHA thinggy....
        $challenge = getParameter($mysql, "recaptcha_challenge_field");
        $response = getParameter($mysql, "recaptcha_response_field");

        $privateCAPTHCAkey = "6LdI69gSAAAAAMGDL9POtz8ackomTjVz3jnwXRKC";
        $resp = recaptcha_check_answer($privateCAPTHCAkey, $_SERVER["REMOTE_ADDR"], $challenge, $response);

        if (!$resp->is_valid) {
            throw new Exception("<p>The reCAPTCHA wasn't entered correctly.</p>" .
                    "<p>Go to <a href='createUserForm.php'>back</a> and try it again.</p>" .
                    "<p>reCAPTCHA said: " . $resp->error . "</p>");
        } else {
            $isHuman = true;
        }
    }

    if ( !$isHuman ) {
        throw new Exception ( "Proof of humanity failed" );
    }
    
    insertUser($mysql, $username, $password, $verificationKey, $email);
    
    //Now send an email
    $to = $email;
    $subject = "Verification email";
    $message = "Hello! Press this link to verify this email address: " .
            "http://rightboard.armyr.se/php_scripts/verifyEmail.php?username=" .
            $username . "&verificationKey=" . $verificationKey;
    $from = "create_new_user_rightboard@armyr.se";
    $headers = "From:" . $from;
    mail($to, $subject, $message, $headers);


    echo "<p>User account created successfully. Check your email and click the link to activate your account.</p>";

} catch (Exception $e) {
    echo ( "<h1>FAIL</h1> " . $e->getMessage() );
}
?> 

