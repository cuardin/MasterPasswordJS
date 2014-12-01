<?php

require_once('../simpletest/autorun.php');  
require_once('../simpletest/web_tester.php');
require_once('../core/utilities.php' );
SimpleTest::prefer(new TextReporter());

class getSeedTest extends WebTestCase {

    function testGetSeed() {
        $this->get(getBaseURL() . "getSeed.php" );        
        $this->assertText('1');          
    }
}