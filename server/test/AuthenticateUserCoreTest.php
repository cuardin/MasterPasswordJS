<?php

require_once('./simpletest/autorun.php');  

class authenticateUserCoreTest extends UnitTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();
        deleteUser( $this->mysql, $this->username );
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
    }
    
    public function tearDown() {        
        deleteUser( $this->mysql, $this->username );
    }
    
    public function testAuthenticateUserSimple() {
        
        validateUser($this->mysql, $this->username );
        $this->assertTrue( authenticateUser($this->mysql, $this->username, 
                $this->password) );
    }
     
    public function testAuthenticateUserNotValidated() {
        try {
            authenticateUser($this->mysql, $this->username, 
                $this->password);
            $this->fail( "No exception cought");
        } catch ( Exception $e ) {
            $this->assertEqual( "User not validated", $e->getMessage() );
        }        
    }
    
    public function testAuthenticateUserWrongUsername() {
        validateUser($this->mysql, $this->username );
        try {
            authenticateUser($this->mysql, "n/a", 
                $this->password);
            $this->fail( "No exception cought");
        } catch ( Exception $e ) {
            $this->assertEqual( "Unknown user name", $e->getMessage() );
        }        
    }

    public function testAuthenticateUserWrongPassword() {
        validateUser($this->mysql, $this->username );
        try {
            authenticateUser($this->mysql, $this->username, 
                "N/A");
            $this->fail( "No exception cought");
        } catch ( Exception $e ) {
            $this->assertEqual( "Wrong password", $e->getMessage() );
        }        
    }   

}

?>
