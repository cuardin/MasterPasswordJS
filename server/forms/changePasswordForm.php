<!--
To change this template, choose Tools | Templates
and open the template in the editor.
-->
<!DOCTYPE html>
<html>
    <head>
        <title>Change Password</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body>        
        <form action="http://www.armyr.se/rightboard/php_scripts/changePassword.php" method="POST">
            <table>
            <tr><td>Username:</td><td><input type="text" name="username"></td></tr>
            <tr><td>Old password:</td><td><input type="password" name="password"></td></tr>
            <tr><td>New password:</td><td><input type="password" name="newPassword1"></td></tr>
            <tr><td>New password again:</td><td><input type="password" name="newPassword2"></td></tr>
            <tr><td colspan="2" align="right"><input type="submit"></td></tr>
            </table>
        </form>        
    </body>
</html>
