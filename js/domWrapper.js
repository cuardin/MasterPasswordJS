
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

function getAllInputsFromForm(  ) {    
    var data = {};
    data.userName = $('#userName').val();
    data.masterPassword = $('#masterPassword').val();
    data.email = $('#email').val();       
    data.siteName = $('#siteName').val();
    data.siteCounter = parseInt($('#siteCounter').val());
    data.siteType = $('#siteType').val();    
    data.capchaResponse = $("#recaptcha_response_field").val();
    data.capchaChallenge = $("#recaptcha_challenge_field").val();
    return data;
}

function popupDialog( title, message ){
    $("#infoDialog").dialog("option", "title", title);
    $("#infoDialog").html( "<p>" + message + "</p>" );
    $("#infoDialog").dialog("open");
}