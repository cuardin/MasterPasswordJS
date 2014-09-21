<?php
require_once('./simpletest/autorun.php');  
require_once('../core/utilities.php');
require_once('../core/fileManagementCore.php');

class FileManagementCoreTest extends UnitTestCase {
    
    private $mysql = null;
    private $username = "testUser";
    private $password = "testPassword";
    private $verificationKey = "testKey";
    private $email = "email@host.domain";
    private $privateKey = null;
    private $fileName = "testFile";
    private $fileContents = "testFileContentsFileManagementCore";
    private $fileID = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getPrivateKey();
                        
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
    
    public function testDoGetNumberOfFilesBelongingToUser() {
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 1, $numberOfFiles );
    }

    public function testDeleteAllFilesBelongingToUser() {
        //Createa an additional file
        insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);
        //Nw delete all files we own
        deleteAllFilesBelongingToUser($this->mysql, $this->username );        
        
        //And check that they in fact dissappeared.
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 0, $numberOfFiles );
        
    }
    
    public function testInsertAndDeleteFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, "testInsertFileSimple");        
        $this->assertTrue( $fileID > 0 );
        
        //Check that the user has a total of 2 files.
        $numberOfFiles = getNumberOfFilesBelongingToUser ( $this->mysql, $this->username );
        $this->assertEqual( 2, $numberOfFiles );
        
        //Check that we actually made the file as well.
        $this->assertEqual( "testInsertFileSimple", 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));
        
        //Now delete the file
        deleteFile( $this->mysql, $fileID);
        
        //Check that we actually made the file as well.
        $this->assertEqual( "", 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));       
    }    
    
    public function testGetFileSimple() {        
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $content = getOneValueFromFileList($this->mysql, "fileContents", $fileID);
        $this->assertEqual($content, $this->fileContents );
    }        
    
    public function testOverwriteFileSimple() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );
        $originalDate = getOneValueFromFileList($this->mysql, "creationDate", $fileID);
                
        $newContent = "testOverwriteFileSimpleContent";
        
        //Pause 1.5 seconds to ensure clock has ticked.
        sleep(1.5);
        
        //Now overwrite the file
        overwriteFile( $this->mysql, $fileID, $newContent);
        
        //Check that we actually made the file as well.
        $this->assertEqual( $newContent, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));       
        
        $newDate = getOneValueFromFileList($this->mysql, "creationDate", $fileID);
        
        $this->assertNotEqual ( $newDate, $originalDate );
    }
    
    public function testOverwriteFileWrongID() {        
        //Create an additional file
        $fileID = insertFile($this->mysql, $this->username, 
                $this->fileName, $this->fileContents);        
        $this->assertTrue( $fileID > 0 );
                      
        $newContent = "testOverwriteFileSimpleContent";
        //Now overwrite the file
        overwriteFile( $this->mysql, -1, $newContent);
        
        //Check that we actually made the file as well.
        $this->assertEqual( $this->fileContents, 
                getOneValueFromFileList($this->mysql, "fileContents", $fileID));       
    }
}



?>
