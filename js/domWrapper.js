
function setMainDivHTML( html ) {
    $("mainDiv").html(html);        
    $("createUserDialog").html(""); //Clear the popup.
}

function setEventHandlerOnClass( cls, event, handler ) {
    inputList = document.getElementsByClassName(cls);
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].addEventListener(event, handler);
    }
}

function setEventHandlerOnID( id, event, handler ) {
    document.getElementById(id).addEventListener(event, handler);   
}

function getAllInputsFromForm( masterKey ) {
    if ( masterKey === undefined ) {
        throw new Error( "Master Key may not be undefined.");
    }
    var data = {};
    data.userName = $('#userName').val();
    data.masterPassword = $('#masterPassword').val();
    data.email = $('#email').val();    
    data.masterKey = masterKey;
    data.siteName = $('#siteName').val();
    data.siteCounter = parseInt($('#siteCounter').val());
    data.siteType = $('#siteType').val();    
    return data;
}

function popupDialog( title, message ){
    $("#infoDialog").dialog("option", "title", title);
    $("#infoDialog").html( "<p>" + message + "</p>" );
    $("#infoDialog").dialog("open");
}