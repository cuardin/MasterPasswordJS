<?php

require_once('../simpletest/autorun.php');  
require_once('../simpletest/web_tester.php');
require_once('../core/fileManagementCore.php');
require_once('../core/userManagementCore.php');
SimpleTest::prefer(new TextReporter());

class FileManagementTests extends WebTestCase {
    private $mysql = null;
    private $username = "testUSER";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "test@armyr.se";
    private $privateKey = null;     
    private $fileName = "testFile";
    private $fileContents = "FileManagementTestsContent";
    
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
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        deleteUser( $this->mysql, $this->username );
    }

    function testCreateNewFileSimple() {
        $this->get(getBaseURL() . "uploadFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName&fileContents=$this->fileContents");        
        $this->assertText('OK');                
        
        $this->assertEqual(1, getNumberOfFilesBelongingToUser($this->mysql, $this->username));
    }
    
    function testCreateNewFileBadUsername() {
        $this->get(getBaseURL() . "uploadFile.php?" .
                "username=--&password=$this->password&" .
                "fileName=$this->fileName&fileContents=$this->fileContents");        
        $this->assertText('FAIL');                
        
        $this->assertEqual(0, getNumberOfFilesBelongingToUser($this->mysql, $this->username));
    }
    
    function testCreateNewFileBadPassword() {
        $this->get(getBaseURL() . "uploadFile.php?" .
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
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));
       
        $this->get(getBaseURL() . "deleteFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName");        
        $this->assertText('OK');                

        
        //Check that we actually deleted the file as well.
        $this->assertEqual( "", 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));       
    }    
    
    public function testDeleteFileBadPassword() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));
       
        $this->get(getBaseURL() . "deleteFile.php?" .
                "username=$this->username&password=--&" .
                "fileID=$fileID");        
        $this->assertText('FAIL');                
        
    }    

    public function testDeleteFileWrongOwner() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));
       
        $this->get(getBaseURL() . "deleteFile.php?" .
                "username=anotherUser&password=$this->password&" .
                "filename=$this->fileName");        
        $this->assertText('FAIL');                
                
    }

    public function testGetFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get(getBaseURL() . "getFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName");        
        $this->assertText("OK: $this->fileContents"); 

    }

    public function testGetFileWrongPassword() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get(getBaseURL() . "getFile.php?" .
                "username=$this->username&password=--&" .
                "fileID=$fileID");        
        $this->assertText("FAIL");                

    }
   public function testGetFileWrongOwner() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, "testUser2", 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get(getBaseURL() . "getFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileID=$fileID");        
        $this->assertText("FAIL");                

        deleteAllFilesBelongingToUser($this->mysql, "testUser2");
    }
    
    public function testListFilesSimple() {        
        //Create an additional file
        insertFile($this->mysql, $this->username, 
                "testListFilesSimple01NameÅÄÖ", "testListFilesSimple01ContentÅÄÖ");        
        insertFile($this->mysql, $this->username, 
                "testListFilesSimple02NameÅÄÖ", "testListFilesSimple02ContentÅÄÖ");        
               
        $this->get(getBaseURL() . "listFiles.php?" .
                "username=$this->username&password=$this->password");                        
        
        $this->assertMime("application/json");                
        $this->assertText(json_encode("testListFilesSimple01NameÅÄÖ"));
        $this->assertText(json_encode("testListFilesSimple02NameÅÄÖ"));  
        $this->assertText(json_encode("testListFilesSimple01ContentÅÄÖ"));
        $this->assertText(json_encode("testListFilesSimple02ContentÅÄÖ"));        
    }
    
    public function testListFilesWrongPassword() {        
        //Create an additional file
        $fileID01 = insertFile($this->mysql, $this->username, 
                "testListFilesSimple01Name", "testListFilesSimple01Content");                        
       
        $this->get(getBaseURL() . "listFiles.php?" .
                "username=$this->username&password=--");        
        $this->assertText("FAIL: BAD_LOGIN");                
        $this->assertNoText("testListFilesSimple01Name");        
        $this->assertNoText("$fileID01");        
    }
    
    public function testListFilesWrongUserName() {        
        //Create an additional file
        
        $this->get(getBaseURL() . "listFiles.php?" .
                "username=--&password=$this->password");        
        $this->assertText("FAIL: BAD_LOGIN");                        
    }
        
    public function testOverwriteFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
            $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );        
                
        $newContent = "testOverwriteFileSimpleContent";
        
        $this->get(getBaseURL() . "uploadFile.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName&fileContents=$newContent");        
        $this->assertText('OK');

        
        //Check that we actually deleted the file as well.
        $this->assertEqual( $newContent, 
                getOneValueFromFileList($this->mysql, "fileContents", 
                        $this->username, $this->fileName));       
    } 
        

    public function testFileExistsSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );                       
       
        $this->get(getBaseURL() . "fileExists.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=$this->fileName");        
        $this->assertText("OK: true"); 

    }
    
    public function testFileNotExists() {                       
        $this->get(getBaseURL() . "fileExists.php?" .
                "username=$this->username&password=$this->password&" .
                "fileName=anotherFileName");        
        $this->assertText("OK: false"); 

    }
    
    public function testDeleteAllFilesBelongingToUser() {
        //Createa an additional file
        insertFile($this->mysql, $this->username, 
                "aFirstFileName", $this->fileContents);
        insertFile($this->mysql, $this->username, 
                "otherFileName", $this->fileContents);
        
        //Nw delete all files we own
        
        $this->get(getBaseURL() . "deleteAllFilesBelongingToUser.php?" .
            "username=$this->username&password=$this->password");        
        $this->assertText("OK"); 
        
        //And check that they in fact dissappeared.
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 0, $numberOfFiles );
        
    }

}
