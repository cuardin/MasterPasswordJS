<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
require_once('../core/bugReportCore.php');
SimpleTest::prefer(new TextReporter());

class ReportBugTestsForm extends WebTestCase {
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;     

    private $description = "Description";
    private $reproduction = "Reproduction";
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();

        deleteUser( $this->mysql, $this->username );
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
        validateUser($this->mysql, $this->username );
        
    }
    
    public function tearDown() {        
        doDeleteAllReportsBelongingToUser($this->mysql, $this->username);
        deleteUser( $this->mysql, $this->username );
    }
    

    function testSubmitReportSimple() {
        $this->get("http://rightboard.armyr.se/php_scripts/forms/reportBugForm.php");        
        $this->assertResponse( array(200) );
        $this->assertTrue( $this->setField("username", $this->username));
        $this->assertTrue( $this->setField("password", $this->password));                
        $this->assertTrue( $this->setField("description", $this->description));
        $this->assertTrue( $this->setField("reproduction", $this->reproduction));
        $this->clickSubmit();
        $this->assertText( "successfully" );                
    }
    
}
  
?>
