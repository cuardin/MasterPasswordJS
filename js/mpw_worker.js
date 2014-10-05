if ( typeof importScripts === 'function') {
    var c = '?a=6';
    importScripts('core/encoding-indexes.js' + c );
    importScripts('core/encoding.js' + c );

    importScripts('core/jssha256.js' + c);
    importScripts('core/pbkdf2.js' + c);
    importScripts('core/scrypt.js' + c);

    importScripts('core/util.js' + c);
    importScripts('core/mpw.js' + c);
    importScripts('database.js' + c);

    self.addEventListener('message', handleMessage);
}

var mpw = new MPW();
var webStorageSite = 'masterPasswordWebStorage';

function handleMessage(event) {    
    var data = JSON.parse(event.data);                

    try {       
        if ( data.command === "mainCompute" ) {                                    
            var returnValue = computeMainKey( data.userName, data.masterPassword, mpw, postProgress );
            postMessage( JSON.stringify(returnValue) );
            
        } else if ( data.command === "siteCompute" ) {
            var returnValue = computeSitePassword( data.masterKey, data.siteType, data.siteName, data.siteCounter, mpw );            
            postMessage( JSON.stringify(returnValue) );
            
        } else if ( data.command === "createUser" ) {
            var returnValue = createUser( data.masterKey, data.userName, data.email, mpw );            
            postMessage( JSON.stringify(returnValue) );
            
        } else if ( data.command === "saveSite" ) {
            var returnValue = saveSite( data.masterKey, data.userName, data.site, mpw );     
            postMessage( JSON.stringify(returnValue) );        
            
        } else if ( data.command === "deleteSite" ) {
            var returnValue = deleteSite( data.masterKey, data.userName, data.siteName, mpw );            
            postMessage( JSON.stringify(returnValue) );        

        } else {
            throw new Error("Unknown command: " + data.command );            
        }
    } catch ( error ) {
        var returnValue = {};
        returnValue.type = "error";        
        returnValue.message = error.message;
        returnValue.fileName = error.fileName;
        returnValue.lineNumber = error.lineNumber;
   
   
        postMessage(JSON.stringify(returnValue));
    }
    
}

function postProgress( i, p )
{
    var returnValue = {};
    returnValue.type = "progress";
    returnValue.data = 100.0*i/p;
    postMessage( JSON.stringify(returnValue) );    
}

function loadSiteList( masterKey, userName )
{    
    var password = mpw.mpw_compute_site_password( masterKey, 'long', webStorageSite, 1 );
    var siteList = dbGetSiteList( userName, password );    
    return siteList; 
}

function computeMainKey( userName, masterPassword, mpw, postProgress ) {
    var masterKey = mpw.mpw_compute_secret_key( userName, masterPassword, postProgress );              
    var siteList = loadSiteList(masterKey, userName );
    
    var returnValue = {};
    returnValue.type = "mainKey";
    returnValue.data = masterKey;            
    returnValue.siteList = siteList;
    
    return returnValue;
}
function computeSitePassword( masterKey, siteType, siteName, siteCounter, mpw )
{
    var password = mpw.mpw_compute_site_password( masterKey, siteType, siteName, siteCounter );
    var returnValue = {};
    returnValue.type = "password";
    returnValue.data = password;
    return returnValue;
}

function createUser( masterKey, userName, email, mpw )
{
    //Compute the password to be used to identify this user.
    var password = mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );

    //Now use the password to create a user.
    var antiSpamKey = "UPP7fXLerV";
    var rValue = dbCreateUser( userName, password, email, antiSpamKey, false);            

    var returnValue = {};
    returnValue.type = "userSubmitted";
    returnValue.data = rValue;
    
    return returnValue;
}

function saveSite( masterKey, userName, site, mpw )
{
    //Compute the password to be used to identify this user.
    var password = mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );
    
    dbSaveSite( userName, password, site.siteName, JSON.stringify(site) );

    var returnValue = {};
    returnValue.type = "siteSaved";
    returnValue.data = site;
    
    return returnValue;
}

function deleteSite( masterKey, userName, siteName, mpw )
{
    //Compute the password to be used to identify this user.
    var password = mpw.mpw_compute_site_password( masterKey, "long", webStorageSite, 1 );

    dbDeleteSite( userName, password, siteName );

    var returnValue = {};
    returnValue.type = "siteDeleted";
    returnValue.data = siteName;
    
    return returnValue;
}