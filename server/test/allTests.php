<?php
require_once('simpletest/autorun.php');

class AllTests extends TestSuite {
    function AllTests() {
        $this->TestSuite('All tests');
        $this->addFile('UtilitiesSecretTest.php');
        $this->addFile('UtilitiesTest.php');
        $this->addFile('UserManagementCoreTest.php');
        $this->addFile('UserManagementTest.php');
        $this->addFile('UserManagementTestForm.php');        
        $this->addFile('AuthenticateUserCoreTest.php');
        $this->addFile('AuthenticateUserTest.php');
        $this->addFile('FileManagementTests.php');
        $this->addFile('FileManagementCoreTest.php');
        $this->addFile('TestReportBugCore.php');
        $this->addFile('TestReportBug.php');
        $this->addFile('TestReportBugForm.php');
    }
}
?>