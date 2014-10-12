
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

