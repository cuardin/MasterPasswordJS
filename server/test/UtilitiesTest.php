<?php
require_once('./simpletest/autorun.php');  
require_once('../core/utilities.php');
require_once('../core/fileManagementCore.php');

class UtilitiesTest extends UnitTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;
    private $fileName = "testFile";
    private $fileContents = "testFileContents";
    private $fileID = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();

        deleteUser( $this->mysql, $this->username );
        insertUser($this->mysql, $this->username, $this->password, 
                $this->verificationKey, $this->email);
        validateUser($this->mysql, $this->username );
        
        
        $this->fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);
    }
    
    public function tearDown() {        
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        deleteUser( $this->mysql, $this->username );
    }

    public function testRandString() {
        $length = 32;
        $string1 = rand_string($length);
        $string2 = rand_string($length);
        $this->assertNotEqual( $string1, $string2 );
        $this->assertEqual($length, strlen($string1) );
    }
    
    public function testGetOneValueFromUserListDatabase() {
        $value = getOneValueFromUserList($this->mysql, "username", $this->username);
        $this->assertEqual($value, $this->username);
    }
    
    public function testGetOneValueFromFileList()
    {
        $value = getOneValueFromFileList($this->mysql, "fileName", $this->fileID );
        $this->assertEqual($value, $this->fileName);
    }
    
    public function testGetOneValueFromDataBase() {
        $query = 'SELECT email FROM whiteboard_users WHERE username=?';    
        $email = getOneValueFromDataBase($this->mysql, $query, $this->username);
        
        $this->assertEqual($email, $this->email);
    }
    
    public function testGetOneValueFromDataBaseSyntaxError() {
        $query = 'S=?';  //Nonsense SQL   
        try {
            getOneValueFromDataBase($this->mysql, $query, $this->username);
            $this->fail ( "No exception cought" );
        } catch ( Exception $e ) {
            $this->assertEqual("SQL Syntax Error", $e->getMessage());
        }            
    }
    
    public function testGetOneValueFromDataBaseNoData() {
        $query = 'SELECT email FROM whiteboard_users WHERE username=?';    
        
        $value = getOneValueFromDataBase($this->mysql, $query, "n/a");
            
        $this->assertNull( $value );
    }
    
    public function testVerifyOwnerOfFileTrue() {
        $isOwner = verifyOwnerOfFile($this->mysql, $this->username, $this->fileID);
        $this->assertTrue( $isOwner );
    }

    public function testVerifyOwnerOfFileFalse() {
        $isOwner = verifyOwnerOfFile($this->mysql, $this->username, -1);
        $this->assertFalse( $isOwner );
    }
 
    public function testGetParameterSimpleGET ()
    {
        $_GET["a"] = "b";
        $this->assertEqual( "b", getParameter($this->mysql,"a") );
    }
    
    public function testGetParameterSimplePOST ()
    {
        $_POST["a"] = "b";
        $this->assertEqual( "b", getParameter($this->mysql,"a") );
    }
    
    public function testGetParameterMisingParameter ()
    {        
        try {
            getParameter($this->mysql,"c");
            $this->fail();
        } catch ( Exception $e ) {
            $this->pass();
        }
    }
}



?>
