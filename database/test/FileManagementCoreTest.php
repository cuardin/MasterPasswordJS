<?php
require_once('../simpletest/autorun.php');  
require_once('../core/utilities.php');
require_once('../core/fileManagementCore.php');
require_once('../core/userManagementCore.php');

class FileManagementCoreTest extends UnitTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "test@armyr.se";
    private $privateKey = null;
    private $fileName = "testFile";
    private $fileContents = "testFileContentsFileManagementCore";
    private $fileID = null;
    
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getUserEditKey();
        
        //Clean first.
        deleteAllFilesBelongingToUser($this->mysql, $this->username );            
        deleteUser( $this->mysql, $this->username );    
        
        //Then setup.
        insertUser($this->mysql, $this->username, $this->password,
                $this->verificationKey, $this->email);
        clearValidationData($this->mysql, $this->username, $this->password );
                
        $this->fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);
    }
    
    public function tearDown() {        
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        
        deleteUser( $this->mysql, $this->username );
    }
        
    
    public function testDoGetNumberOfFilesBelongingToUser() {
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 1, $numberOfFiles );
    }
    
    
    public function testDeleteAllFilesBelongingToUser() {
        //Createa an additional file
        insertFile($this->mysql, $this->username, 
                "otherFileName", $this->fileContents);
        //Nw delete all files we own
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        
        //And check that they in fact dissappeared.
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 0, $numberOfFiles );
        
    }
    
    public function testInsertAndDeleteFileSimple() {        
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 1, $numberOfFiles );        
        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                "secondFile", "testInsertFileSimple");        
        $this->assertTrue( $fileID > 0 );
        
        //Check that the user has a total of 2 files.
        $numberOfFiles2 = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 2, $numberOfFiles2 );
        
        //Check that we actually made the file as well.
        $this->assertEqual( "testInsertFileSimple", 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, "secondFile"));
        
        //Now delete the file
        deleteFile( $this->mysql, $this->username, "secondFile");
        
        //Check that we actually made the file as well.
        $this->assertEqual( "", 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, "secondFile"));       
    }    
    
    public function testFileExists() {        
        //Check thatt the standard file exists.
        $this->assertTrue(fileExists($this->mysql, $this->username,$this->fileName));
        
        //Check that the same file by a different user does not exist.
        $this->assertFalse(fileExists($this->mysql, "anotherUser",$this->fileName));
        
        //Check that a different file by the same user does not exist.
        $this->assertFalse(fileExists($this->mysql, $this->username,"anotherFile"));
    }
    
    public function testDeleteFileBelongingToOtherUser() {        
        //DElete a file belonging to another user.
        $OK = deleteFile($this->mysql, "anotherUser", $this->fileName );        
        
        //Check that we got an error.
        $this->assertFalse($OK);
        
    }

    public function testGetFileSimple() {        
        $content = getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName);
        $this->assertEqual($content, $this->fileContents );
    }        
    
    public function testOverwriteFileSimple() {        
        //overwrite the standard file        
        $newContent = "testOverwriteFileSimpleContent";
                        
        overwriteFile( $this->mysql, $this->username, $this->fileName, $newContent);
        
        //Check that we actually made the file as well.
        $this->assertEqual( $newContent, 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));                      
                
    }
    
    public function testOverwriteFileWrongName() {        
        //Now overwrite the standard file                      
        $newContent = "testOverwriteFileSimpleContent";

        overwriteFile( $this->mysql, $this->username, "wrongFileName", $newContent);
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $this->username, $this->fileName));       
    }
    
    public function testGetOneValueFromFileList()
    {
        $value = getOneValueFromFileList($this->mysql, "fileName", $this->username, $this->fileName);
        $this->assertEqual($value, $this->fileName);
    }

}

