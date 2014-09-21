<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
require_once('../core/bugReportCore.php');
SimpleTest::prefer(new TextReporter());

class ReportBugTests extends WebTestCase {
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
        $this->get("http://rightboard.armyr.se/php_scripts/reportBug.php?" .
                "username=$this->username&password=$this->password&" .
                "description=$this->description&reproduction=$this->reproduction");        
        $this->assertText('OK');                                   
        
        $this->assertEqual(1, getNumberOfReportsBelongingTo($this->mysql, $this->username));
    }
        
    function testSubmitCrashReportSimple() {
        $this->get("http://rightboard.armyr.se/php_scripts/reportBug.php?" .
                "username=$this->username&password=$this->password&" .
                "stacktrace=$this->stacktrace&state=$this->state");        
        $this->assertText('OK');                                   
        
        $this->assertEqual(1, getNumberOfReportsBelongingTo($this->mysql, $this->username));
    }
    
    function testSubmitReportWrongUsername() {
        $this->get("http://rightboard.armyr.se/php_scripts/reportBug.php?" .
                "username=--&password=$this->password&" .
                "description=$this->description&reproduction=$this->reproduction");        
        $this->assertText('FAIL');                
        
        $this->assertEqual(0, getNumberOfReportsBelongingTo($this->mysql, $this->username));
    }
    
    function testSubmitReportWrongPassword() {
        $this->get("http://rightboard.armyr.se/php_scripts/reportBug.php?" .
                "username=$this->username&password=--&" .
                "description=$this->description&reproduction=$this->reproduction");        
        $this->assertText('FAIL');                
        
        $this->assertEqual(0, getNumberOfReportsBelongingTo($this->mysql, $this->username));
    }
}
  
?>
