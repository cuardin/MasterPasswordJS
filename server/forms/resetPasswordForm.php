<!--
To change this template, choose Tools | Templates
and open the template in the editor.
-->
<!DOCTYPE html>
<html>
    <head>
        <title>Reset Password</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body>        
        <form action="http://www.armyr.se/rightboard/php_scripts/resetPassword.php" method="POST">
            <p>Username: <input type="text" name="username"></p>                        
            <?php
            require_once('../core/recaptchalib.php');
            $publickey = "6LdI69gSAAAAADgNiIJ0q50vek6kTjj4vjMxWeTy";
            echo recaptcha_get_html($publickey);
            ?>
            <input type="text" hidden name="privateKey">
            <p><input type="submit"></p>            
        </form>        
    </body>
</html>
