<?php

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
//$makeJS = getParameter("javascript");
