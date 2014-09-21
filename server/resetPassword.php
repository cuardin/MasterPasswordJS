<?php

require_once ( './core/utilities.php' );
require_once ( './core/userManagementCore.php' );
require_once ( './core/recaptchalib.php' );


try {
    $mysql = connectDatabase();

    $randomPassword = rand_string(8);

    //Escape all the user input to be SQL safe.
    $username = getParameter($mysql, "username");
    $privateKey = getParameter($mysql, "privateKey");

    if (strcmp($privateKey, getPrivateKey())) {

        // RECAPTCHA thinggy....

        $challenge = getParameter($mysql, "recaptcha_challenge_field");
        $response = getParameter($mysql, "recaptcha_response_field");

        $privatekey = "6LdI69gSAAAAAMGDL9POtz8ackomTjVz3jnwXRKC";
        $resp = recaptcha_check_answer($privatekey, $_SERVER["REMOTE_ADDR"], $challenge, $response);

        if (!$resp->is_valid) {
            die("<p>FAIL: The reCAPTCHA wasn't entered correctly.</p>" .
                    "<p>Go to <a href='resetPassword.php'>back</a> and try it again.</p>" .
                    "<p>reCAPTCHA said: " . $resp->error . "</p>");
        }
    }

    changePassword($mysql, $username, $randomPassword);


//Now send an email
    $to = getOneValueFromUserList($mysql, "email", $username);
    $subject = "New password email";
    $message = "Hello! New password is: " . $randomPassword;
    $from = "reset_password_rightboard@armyr.se";
    $headers = "From:" . $from;
    mail($to, $subject, $message, $headers);

    echo "<h1>OK</h1> Password reset successfully.";
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage();
}
?> 

