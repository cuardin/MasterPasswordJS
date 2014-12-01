<?php

function configParamSet( $param ) {
    $armyr_se = array( "SQLUserName" => "", 
        "SQLPassword" => "", 
        "SQLDBName" => "",
        "BaseURL" => "",
        "CAPCHAPublic" => "",
        "CAPCHAPrivate" => "",
        "UserEditKey" => "",
        "GlobalSeed" => 1,
        "MaxUsers" => 100,
        "MaxFiles" => 1000);
    $local_server = array( "SQLUserName" => "root", 
        "SQLPassword" => "", 
        "SQLDBName" => "",
        "BaseURL" => "",
        "CAPCHAPublic" => "",
        "CAPCHAPrivate" => "",
        "UserEditKey" => "",
        "GlobalSeed" => 1,
        "MaxUsers" => 100,
        "MaxFiles" => 10000);
    $configSet = array( '192.168.56.101' => $local_server, 'masterpassword.armyr.se' => $armyr_se );
    
    return $configSet[$_SERVER['HTTP_HOST']][$param];
}

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
