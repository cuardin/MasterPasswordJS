<?php

require_once('./simpletest/autorun.php');  
require_once('./simpletest/web_tester.php');
require_once('../core/fileManagementCore.php');
SimpleTest::prefer(new TextReporter());

class FileManagementTests extends WebTestCase {
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;     
    private $fileName = "testFile";
    private $fileContents = "FileManagementTestsContent";
    
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
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        deleteUser( $this->mysql, $this->username );
    }

    function testCreateNewFileSimple() {
        $this->get("http://rightboard.armyr.se/php_scripts/createNewFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName&fileContents=$this->fileContents");        
        $this->assertText('OK');                
        
        $this->assertEqual(1, getNumberOfFilesBelongingToUser($this->mysql, $this->username));
    }
    
    function testCreateNewFileBadUsername() {
        $this->get("http://rightboard.armyr.se/php_scripts/createNewFile.php?" .
                "username=--&password=$this->password&" .
                "fileName=$this->fileName&fileContents=$this->fileContents");        
        $this->assertText('FAIL');                
        
        $this->assertEqual(0, getNumberOfFilesBelongingToUser($this->mysql, $this->username));
    }
    
    function testCreateNewFileBadPassword() {
        $this->get("http://rightboard.armyr.se/php_scripts/createNewFile.php?" .
                "username=$this->username&password=--&" .
                "fileName=$this->fileName&fileContents=$this->fileContents");        
        $this->assertText('FAIL');                
        
        $this->assertEqual(0, getNumberOfFilesBelongingToUser($this->mysql, $this->username));
    }
    
    public function testDeleteFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));
       
        $this->get("http://rightboard.armyr.se/php_scripts/deleteFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID");        
        $this->assertText('OK');                

        
        //Check that we actually deleted the file as well.
        $this->assertEqual( "", 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));       
    }    
    
    public function testDeleteFileBadPassword() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));
       
        $this->get("http://rightboard.armyr.se/php_scripts/deleteFile.php?" .
                "username=$this->username&password=--&" .
                "fileID=$fileID");        
        $this->assertText('FAIL');                
        
    }    

    public function testDeleteFileWrongOwner() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, "testUser2", 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));
       
        $this->get("http://rightboard.armyr.se/php_scripts/deleteFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID");        
        $this->assertText('FAIL');                
        
        deleteAllFilesBelongingToUser($this->mysql, "testUser2");
    }

    public function testGetFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get("http://rightboard.armyr.se/php_scripts/getFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID");        
        $this->assertText($this->fileContents);                

    }

    public function testGetFileWrongPassword() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get("http://rightboard.armyr.se/php_scripts/getFile.php?" .
                "username=$this->username&password=--&" .
                "fileID=$fileID");        
        $this->assertText("FAIL");                

    }
   public function testGetFileWrongOwner() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, "testUser2", 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get("http://rightboard.armyr.se/php_scripts/getFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID");        
        $this->assertText("FAIL");                

        deleteAllFilesBelongingToUser($this->mysql, "testUser2");
    }
    
    public function testListFilesSimple() {        
        //Create an additional file
        $fileID01 = insertFile($this->mysql, $this->username, 
                "testListFilesSimple01Name", "testListFilesSimple01Content");        
        $fileID02 = insertFile($this->mysql, $this->username, 
                "testListFilesSimple02Name", "testListFilesSimple02Content");        
        
       
        $this->get("http://rightboard.armyr.se/php_scripts/listFiles.php?" .
                "username=$this->username&password=$this->password");        
        $this->assertMime("text/xml");                
        $this->assertText("testListFilesSimple01Name");
        $this->assertText("testListFilesSimple02Name");        
        $this->assertText("$fileID01");
        $this->assertText("$fileID02");        
    }
    
    public function testListFilesWrongPassword() {        
        //Create an additional file
        $fileID01 = insertFile($this->mysql, $this->username, 
                "testListFilesSimple01Name", "testListFilesSimple01Content");                        
       
        $this->get("http://rightboard.armyr.se/php_scripts/listFiles.php?" .
                "username=$this->username&password=--");        
        $this->assertText("FAIL");                
        $this->assertNoText("testListFilesSimple01Name");        
        $this->assertNoText("$fileID01");        
    }

    public function testOverwriteFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                "$this->fileName"."OverWrite", $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        $newContent = "testOverwriteFileSimpleContent";
        
        $this->get("http://rightboard.armyr.se/php_scripts/overwriteFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID&fileContents=$newContent");        
        $this->assertText('OK');

        
        //Check that we actually deleted the file as well.
        $this->assertEqual( $newContent, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));       
    } 
        
    
}


?>
