<?php
require_once('../simpletest/autorun.php');  
require_once('../core/userManagementCore.php');
require_once('../core/utilities.php');


class UserManagementCoreTest extends UnitTestCase {
    
    private $mysql = null;
    private $username = "testUser";    
    private $username2 = "anotherUser";    
    private $password = "testPassword";
    //private $verificationKey = "testKey";
    private $email = "test@armyr.se";
    private $email2 = "test2@armyr.se";
    private $privateKey = null;
    
    public function setUp() {
        $this->mysql = connectDatabase();
        $this->privateKey = getUserEditKey();

        deleteUser( $this->mysql, $this->username );
        deleteUser( $this->mysql, $this->username2 );
    }
    
    public function tearDown() {        
        deleteUser( $this->mysql, $this->username );
        deleteUser( $this->mysql, $this->username2 );        
    }
    
    public function testInsertAndDeleteUser() {
        
        //echo "Inserting user<br/>";
        $message = insertUser($this->mysql, $this->username, 
                $this->password,  $this->email);
        $this->assertEqual($message, "OK");
        
        //Now check that a user was actually inserted.
        $this->assertEqual( $this->username, 
                getOneValueFromUserList($this->mysql, "username", 
                        $this->username) );
        
        //And check that the password was set.
        $passwordStored = getOneValueFromUserList($this->mysql, "password", 
                        $this->username);        
        $passwordCrypt = crypt($this->password, $passwordStored );
        $this->assertEqual($passwordStored, $passwordCrypt);
        
        //Now delete user
        //echo "Deleting user<br/>";
        deleteUserWithKey( $this->mysql, $this->username, $this->password, "" );
        
        //And check that the user was actually deleted
        $this->assertNull( 
                getOneValueFromUserList($this->mysql, "username", 
                        $this->username) );
    }
    
    public function testInsertUserWithDulicateUsernameOrPassword() {                
        //Arrange
        //Insert a user with an email adress.
        $message1 = insertUser($this->mysql, $this->username, 
                $this->password, $this->email);
        $this->assertEqual($message1, "OK");
        
        //Act
        //Now insert a user with different username but same adress        
        $id2 = insertUser($this->mysql, $this->username2, 
            $this->password, $this->email);
        $this->assertEqual($id2, 0);
        
        //And insert a user with different address but same username
        $id3 = insertUser($this->mysql, $this->username2, 
            $this->password, $this->email);
        $this->assertEqual($id3, 0);
        
    }
    
    public function testDeleteUserWithPrivateKey() {
        //Create a user to delete
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);
                
        deleteUserWithKey( $this->mysql, $this->username, "", $this->privateKey );
        
        //And check that the user was actually deleted
        $this->assertNull( 
                getOneValueFromUserList($this->mysql, "username", 
                        $this->username) );       
    }
    
    public function testDeleteUserWithPassword() {
        //Create a user to delete
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);
                
        deleteUserWithKey( $this->mysql, $this->username, $this->password, "");
        
        //And check that the user was actually deleted
        $this->assertNull( 
                getOneValueFromUserList($this->mysql, "username", 
                        $this->username) );       
    }

    public function testDeleteUserWithWrongPrivateKeyAndPassword() {
        //Create a user to delete
        insertUser($this->mysql, $this->username, $this->password,
                $this->email);                    
        
        $this->expectException();
        deleteUserWithKey( $this->mysql, $this->username, "", "" );
        
    }
         
    
    public function testResetPassword() {
        //Create a user to validate
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);                        
        
        resetPassword( $this->mysql, $this->username, "newKey" );
        
        //Make sure key was actually changed.
        $verificationKey = getOneValueFromUserList($this->mysql, "verificationKey", $this->username);        
        $this->assertEqual($verificationKey, "newKey");
        
        $verificationKeyExpiration = getOneValueFromUserList($this->mysql, "verificationKeyExpiration", $this->username);        
        $this->assertNotNull($verificationKeyExpiration);
        $timeInDb = strtotime($verificationKeyExpiration);
        $timeIn10Min = time()+10*60;
        $timeIn15Min = time()+15*60;
                
        $this->assertTrue($timeInDb >= $timeIn10Min);
        $this->assertTrue($timeInDb <= $timeIn15Min);
        
    }    
    
    public function testSetPassword() {
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);                        
        setPassword( $this->mysql, $this->username, "newPass");
        $newPass = getOneValueFromUserList($this->mysql, "password", $this->username);        
        $this->assertEqual($newPass, crypt("newPass",$newPass));
    }
    
    public function testValidateUserWithKey() {
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);                        
        resetPassword( $this->mysql, $this->username, "newKey" );        
        
        validateUserWithKey($this->mysql, $this->username, "newKey", "newPass");
        
        $newPass = getOneValueFromUserList($this->mysql, "password", $this->username);                
        $this->assertEqual($newPass, crypt("newPass", $newPass) );
    }
    
    public function testValidateUserWithWrongKey() {
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);                        
        resetPassword( $this->mysql, $this->username, "newKey" );        
        
        validateUserWithKey($this->mysql, $this->username, "badKey", "newPass");
        
        //Check that the password was not changed.
        $newPass = getOneValueFromUserList($this->mysql, "password", $this->username);                
        $this->assertEqual($newPass, crypt($this->password, $newPass) );
        
        //Check that the verification key and expiration have been cleared
        $verificationKey = getOneValueFromUserList($this->mysql, "verificationKey", $this->username);                
        $this->assertEqual($verificationKey, "0" );
        $verificationKeyExp = getOneValueFromUserList($this->mysql, "verificationKeyExpiration", $this->username);                
        $this->assertEqual($verificationKeyExp, NULL );
    }           
    
    public function testValidateUserWithZeroKey() {
        insertUser($this->mysql, $this->username, $this->password,
               $this->email);                                
        
        validateUserWithKey($this->mysql, $this->username, "0", "newPass");
        
        //Check that the password was not changed.
        $newPass = getOneValueFromUserList($this->mysql, "password", $this->username);                
        $this->assertEqual($newPass, crypt($this->password, $newPass) );
                
    }           
}
