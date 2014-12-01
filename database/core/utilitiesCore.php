<?php

require_once( dirname(__FILE__).'/utilities.php' );
require_once( dirname(__FILE__).'/utilitiesSecret.php' );

function getSQLUsername()
{
    return configParamSet( "SQLUserName");
}

function getSQLPassword()
{
    return configParamSet( "SQLPassword");
}

function getSQLDBName()
{
    return configParamSet( "SQLDBName");
}

function getBaseURL() {
    return configParamSet( "BaseURL");
}

function getCAPCHAPublicKey() {
    return configParamSet( "CAPCHAPublic");
}

function getCAPCHAPrivateKey() {
    return configParamSet( "CAPCHAPrivate");
}

function getUserEditKey() {
    return configParamSet( "UserEditKey");
}

function getGlobalSeed() {
    return configParamSet( "GlobalSeed");
}


function getMaxNumberOfUsers() {
    return configParamSet( "MaxUsers");
}

function getMaxNumberOfFiles() {
    return configParamSet( "MaxFiles");
}

//If we are asked about javascript code, generate that code
try {
    $makeJS = getParameter("javascript");
    error_log ( "\$makeJS=$makeJS" );
    if ( !strcmp($makeJS,"true") ) {        
        echo "function getUserCreationKey() { return '" . getUserEditKey() . "';}\n";
        echo "function getRootAddress() { return '" . getBaseURL() . "';}\n";        
    }
} catch ( Exception $e ) {
    error_log ( "And error: " . $e->getMessage() );
    //Do nothing.
}
