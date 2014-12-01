<?php

require_once('../simpletest/autorun.php');  
require_once('../simpletest/web_tester.php');
require_once('../core/utilities.php' );
require_once('../core/userManagementCore.php' );
SimpleTest::prefer(new TextReporter());

class AuthenticateUserTest extends WebTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "test@armyr.se";
    private $privateKey = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getUserEditKey();

        //Delete any old test users.
        deleteUser( $this->mysql, $this->username );
        
        //Create a user
        insertUser($this->mysql, $this->username, $this->password,
               $this->verificationKey, $this->email);
        
        //And validate user emial, otherwise we canot authenticate.        
        clearValidationData( $this->mysql, $this->username, $this->password );

    }
    
    public function tearDown() {        
        //deleteUser( $this->mysql, $this->username );
    }

    function testAuthenticateSimple() {
        $this->get(getBaseURL() . "authenticateUser.php?" .
                "username=$this->username&password=$this->password" );        
        $this->assertText('OK');                 
    }
    
    function testAuthenticateBadUserName() {
        $this->get(getBaseURL() . "authenticateUser.php?" .
                "username=--&password=$this->password" );        
        $this->assertText('FAIL: BAD_LOGIN');                 
    }

    function testAuthenticateBadPassword() {
        $this->get(getBaseURL() . "authenticateUser.php?" .
                "username=$this->username&password=--" );        
        $this->assertText('FAIL: BAD_LOGIN');                 
    }        
    
}

