<?php
require_once('../simpletest/autorun.php');

class AllTests extends TestSuite {
    function AllTests() {
        $this->TestSuite('All tests');        
        $this->addFile('UtilitiesTest.php');
        $this->addFile('UserManagementCoreTest.php');
        $this->addFile('UserManagementTest.php');        
        $this->addFile('AuthenticateUserCoreTest.php');
        $this->addFile('AuthenticateUserTest.php');
        $this->addFile('FileManagementTests.php');
        $this->addFile('FileManagementCoreTest.php');
        $this->addFile('GetSeedTest.php');
    }
}