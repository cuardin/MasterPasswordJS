<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
SimpleTest::prefer(new TextReporter());

class AuthenticateUserTest extends WebTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();

        //Delete any old test users.
        deleteUser( $this->mysql, $this->username );
        
        //Create a user
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);
        
        //And validate user emial, otherwise we canot authenticate.        
        validateUser( $this->mysql, $this->username );

    }
    
    public function tearDown() {        
        deleteUser( $this->mysql, $this->username );
    }

    function testAuthenticateSimple() {
        $this->get("http://rightboard.armyr.se/php_scripts/authenticateUser.php?" .
                "username=$this->username&password=$this->password" );        
        $this->assertText('OK');                 
    }
    
    function testAuthenticateBadUserName() {
        $this->get("http://rightboard.armyr.se/php_scripts/authenticateUser.php?" .
                "username=--&password=$this->password" );        
        $this->assertText('FAIL');                 
    }

    function testAuthenticateBadPassword() {
        $this->get("http://rightboard.armyr.se/php_scripts/authenticateUser.php?" .
                "username=$this->username&password=--" );        
        $this->assertText('FAIL');                 
    }        
}


?>
