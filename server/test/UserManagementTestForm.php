<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
SimpleTest::prefer(new TextReporter());

class UserManagementTestForm extends WebTestCase {
    
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
        $this->get("http://rightboard.armyr.se/php_scripts/forms/createUserForm.php");        
        $this->assertResponse( array(200) );
        $this->assertTrue( $this->setField("username", $this->username));
        $this->assertTrue( $this->setField("password1", $this->password));
        $this->assertTrue( $this->setField("password2", $this->password));
        $this->assertTrue( $this->setField("email", $this->email));
        $this->assertTrue( $this->setField("privateKey", $this->privateKey));
        $this->clickSubmit();
        $this->assertText( "successfully" );
    }
     
    function testChangePasswordSimple() {        
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/forms/changePasswordForm.php");        
        $this->assertResponse( array(200) );
        $this->assertTrue( $this->setField("username", $this->username));
        $this->assertTrue( $this->setField("password", $this->password));
        $this->assertTrue( $this->setField("newPassword1", "newPass1"));
        $this->assertTrue( $this->setField("newPassword2", "newPass1"));        
        $this->clickSubmit();
        $this->assertText( "successfully" );
    }
    
     function testResetPasswordSimple() {        
        insertUser($this->mysql, $this->username, $this->password, 
               $this->verificationKey, $this->email);        
        
        validateUser( $this->mysql, $this->username );
        
        $this->get("http://rightboard.armyr.se/php_scripts/forms/resetPasswordForm.php");        
        $this->assertResponse( array(200) );
        $this->assertTrue( $this->setField("username", $this->username));
        $this->assertTrue( $this->setField("privateKey", $this->privateKey));
        $this->clickSubmit();
        $this->assertText( "successfully" );
    }
}


?>
