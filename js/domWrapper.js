
function setMainDivHTML( html ) {
    $("#mainDiv").html(html);        
    $("#createUserDialog").html(""); //Clear the popup.
    $("#loaderDiv").attr( "style", "display: none;" );
    $("#mainDiv").attr( "style", "" );
}

function setEventHandlerOnClass( cls, event, handler ) {
    inputList = document.getElementsByClassName(cls);
    for ( var i = 0; i < inputList.length; i++ ) {
        inputList[i].addEventListener(event, handler);
    }
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
   
    //Now make sure to cap all inputs.
    keys = Object.keys(data);
    for ( var i = 0; i < keys.length; i++ ) {                
        if ( typeof(data[keys[i]]) ===  "string" && data[keys[i]].length > 1024 ) {
            //First truncate the value we read.
            data[keys[i]] = data[keys[i]].substr(0,1024);
            //Then make sure that the input field is truncated as well.
            $("#" + keys[i]).val(data[keys[i]]);
            popupDialog( "Truncated input", "The value of " + keys[i] + " was too long. It has been truncated to 1024 characters." );
        }
    }
    return data;
}

function popupDialog( title, message ){
    $("#infoDialog").dialog("option", "title", title);
    $("#infoDialog").html( "<p>" + message + "</p>" );
    $("#infoDialog").dialog("open");
}