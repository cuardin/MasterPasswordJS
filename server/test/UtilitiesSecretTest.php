<?php
require_once('./simpletest/autorun.php');  
require_once('../core/utilitiesSecret.php');

class UtilitiesSecretTest extends UnitTestCase {
    
    public function testDatabaseConnect() {
        $mysql = connectDatabase();
        $this->assertNotNull( $mysql );        
    }
}

?>
