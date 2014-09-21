<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
SimpleTest::prefer(new TextReporter());

class UserManagementTest extends WebTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";    
    private $email = "email@host.domain";
    private $verificationKey = "testKey";
    private $privateKey = null;
    
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();

        //Delete any old test users.
        deleteUser( $this->mysql, $this->username );                

    }
    
    public function tearDown() {        
        deleteUser( $this->mysql, $this->username );
    }

    function testCreateUserSimple() {        
        $this->get("http://rightboard.armyr.se/php_scripts/createUser.php?" .
                "username=$this->username&password1=$this->password&" .
                "password2=$this->password&" .
                "email=$this->email&privateKey=$this->privateKey");        
        $this->assertText('User account created successfully');                 
    }
    
    function testCreateUserBadKey() {        
        $this->get("http://rightboard.armyr.se/php_scripts/createUser.php?" .
                "username=$this->username&password1=$this->password&" .
                "password2=$this->password&" .
                "email=$this->email&privateKey=--");        
        $this->assertText('FAIL');                 
    }
    
    function testCreateUserMissingParameter() {        
        $this->get("http://rightboard.armyr.se/php_scripts/createUser.php?" .
                "username=$this->username&password1=$this->password&" .                
                "email=$this->email&privateKey=$this->privateKey");        
        $this->assertText('FAIL');                 
    }
    
    function testVerifyUserSimple() {        
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
        
        $this->get("http://rightboard.armyr.se/php_scripts/verifyEmail.php?" .
                "username=$this->username&" .
                "verificationKey=$this->verificationKey");        
        $this->assertText('OK');                 
    }
    
    function testVerifyUserPrivateKey() {        
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
        
        $this->get("http://rightboard.armyr.se/php_scripts/verifyEmail.php?" .
                "username=$this->username&" .
                "privateKey=$this->privateKey");        
        $this->assertText('OK');                 
    }
    
    function testVerifyUserBadKey() {        
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
        
        $this->get("http://rightboard.armyr.se/php_scripts/verifyEmail.php?" .
                "username=$this->username&" .
                "verificationKey=--");        
        $this->assertText('FAIL');                 
    }
    
    
    function testChangePassword() {
        //Create a user to edit.
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );        
        
        $this->get("http://rightboard.armyr.se/php_scripts/changePassword.php?" .
                "username=$this->username&password=$this->password&" .
                "newPassword1=newPassword&newPassword2=newPassword");        
        $this->assertText('Password changed successfully');
        
        //Make sure password was actually changed.
        $passInDB = getOneValueFromUserList($this->mysql, "password", $this->username);
        $newPasswordCrypt = crypt( "newPassword", $passInDB );
        $this->assertEqual($passInDB, $newPasswordCrypt );

    }
    
    function testChangePasswordBadUsername() {
        //Create a user to edit.
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/changePassword.php?" .
                "username=--&password=$this->password&" .
                "newPassword1=newPassword&newPassword2=newPassword");        
        $this->assertText('FAIL');
        
        //Make sure password was not changed.
        $passInDB = getOneValueFromUserList($this->mysql, "password", $this->username);
        $newPasswordCrypt = crypt( $this->password, $passInDB );
        $this->assertEqual($passInDB, $newPasswordCrypt );

    }
    function testChangePasswordBadPassword() {
        //Create a user to edit.
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/changePassword.php?" .
                "username=$this->username&password=--&" .
                "newPassword1=newPassword&newPassword2=newPassword");        
        $this->assertText('FAIL');
        
        //Make sure password was not changed.
        $passInDB = getOneValueFromUserList($this->mysql, "password", $this->username);
        $newPasswordCrypt = crypt( $this->password, $passInDB );
        $this->assertEqual($passInDB, $newPasswordCrypt );

    }
    
    function testChangePasswordUnequalPassword() {
        //Create a user to edit.
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/changePassword.php?" .
                "username=$this->username&password=$this->password&" .
                "newPassword1=newPassword&newPassword2=newPass");        
        $this->assertText('FAIL');
        
        //Make sure password was not changed.
        $passInDB = getOneValueFromUserList($this->mysql, "password", $this->username);
        $newPasswordCrypt = crypt( $this->password, $passInDB );
        $this->assertEqual($passInDB, $newPasswordCrypt );

    }
    
    function testResetPasswordSimple() {
        //Create a user to edit.
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/resetPassword.php?" .
                "username=$this->username&privateKey=" . getPrivateKey() );        
        $this->assertText('OK');
        
        //Make sure password was changed.
        $passInDB = getOneValueFromUserList($this->mysql, "password", $this->username);
        $newPasswordCrypt = crypt( $this->password, $passInDB );
        $this->assertTrue(strcmp($passInDB, $newPasswordCrypt) );

    }
    
    function testCreateAndAuthenticateUser() {
        $this->get("http://rightboard.armyr.se/php_scripts/createUser.php?" .
                "username=$this->username&password1=$this->password&".
                "password2=$this->password&email=email@host.com&".
                "privateKey=" . getPrivateKey() );        
        $this->assertText('successfully');
        
        $this->assertEqual($this->username, getOneValueFromUserList($this->mysql, "username", $this->username));
        
        $storedPassCrypt = getOneValueFromUserList($this->mysql, "password", $this->username);
        $myPassCrypt = crypt($this->password, $storedPassCrypt);
        $this->assertEqual($myPassCrypt, $storedPassCrypt);
        
        $this->get("http://rightboard.armyr.se/php_scripts/verifyEmail.php?" .
                "username=$this->username&".
                "privateKey=" . getPrivateKey() );        
        $this->assertText('OK');
                        
        $this->get("http://rightboard.armyr.se/php_scripts/authenticateUser.php?" .
                "username=$this->username&password=$this->password" );                
        $this->assertText('OK');
    }
        
}


?>
