<?php

require_once('./simpletest/autorun.php');  
require_once('../core/bugReportCore.php');


class ReportBugCoreTest extends UnitTestCase {
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;
    private $description = "Description";
    private $reproduction = "Reproduction";
    private $stacktrace = "StackTrace";
    private $state = "State";
    
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
    
    public function testSubmitBugReport() {
        $id = submitReport($this->mysql, $this->username, $this->description, 
                $this->reproduction, null, null);        
        $this->assertNotEqual(null, $id);        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "description", $id), 
                $this->description );
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "reproduction", $id), 
                $this->reproduction );        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "stacktrace", $id), 
                null );        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "state", $id), 
                null );        
    }         
    
    public function testSubmitCrashReport() {
        $id = submitReport($this->mysql, $this->username, null, null, 
                $this->stacktrace, $this->state);        
        $this->assertNotEqual(null, $id);        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "description", $id), 
                null );
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "reproduction", $id), 
                null );        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "stacktrace", $id), 
                $this->stacktrace );        
        $this->assertEqual( 
                getOneValueFromReportList($this->mysql, "state", $id), 
                $this->state );        
    }         
    

    public function testGetNumberOfReportsBelongingToUser() {
        submitReport($this->mysql, $this->username, $this->description, 
                $this->reproduction, null, null);
        $nReports = getNumberOfReportsBelongingTo( $this->mysql, $this->username );
        $this->assertEqual(1, $nReports);        
    } 

    public function testDeleteAllReportsBelongingToUser() {
        submitReport($this->mysql, $this->username, $this->description, 
                $this->reproduction, null, null );
        doDeleteAllReportsBelongingToUser($this->mysql, $this->username);        
        $nReports = getNumberOfReportsBelongingTo( $this->mysql, $this->username );
        $this->assertEqual(0, $nReports);        
    } 

}
?>
