<?php

function configParamSet( $param ) {
    $server01 = array( "BaseURL" => "https://domain.top/path/",
        "CAPCHAPublic" => "",
        "CAPCHAPrivate" => "",
        "userEditKey" => "" );
    $server02 = array( "BaseURL" => "https://localhost/path/",
        "CAPCHAPublic" => "",
        "CAPCHAPrivate" => "",
        "userEditKey" => "" );
    $configSet = array( 'domain.top' => $server01, 'localhost' => $server02 );
    
    return $configSet[$_SERVER['HTTP_HOST']][$param];
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
    return configParamSet( "userEditKey");
}


$baseURL = getBaseURL();
echo "function getRootAddress() { return '$baseURL'; }\n";
$userEditKey = getUserEditKey();
echo "function getUserCreationKey() { return '$userEditKey'; }\n";

