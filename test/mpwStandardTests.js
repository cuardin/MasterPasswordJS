QUnit.module("module", undefined);

(function ()
{
    var decodeEntities = (function() {
        // this prevents any overhead from creating the object each time
        var element = document.createElement('div');

        function decodeHTMLEntities (str) {
          if(str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
          }

          return str;
        }

        return decodeHTMLEntities;
    })();

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "mpw_tests.xml", false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    var tests = xmlDoc.documentElement.childNodes;
    var testData = {};

    for (var i = 0; i < tests.length; i += 1) {
        if (tests[i].nodeType !== 1) {
            continue;
        }
        //console.log( tests[i] );
        var thisTestData = tests[i].childNodes;

        var thisTest = {};
        var parentID = tests[i].getAttribute('parent');
        if (parentID !== null) {
            //Perform deep copy.
            thisTest = JSON.parse(JSON.stringify(testData[parentID]));
        }

        thisTest.id = tests[i].getAttribute('id');

        for (var j = 0; j < thisTestData.length; j++) {
            if (thisTestData[j].nodeType !== 1) {
                continue;
            }
            //innerHTML is probably not right here, but it seems to work.
            thisTest[thisTestData[j].nodeName] = decodeEntities(thisTestData[j].innerHTML);

        }
        testData[thisTest.id] = thisTest;
    }
    console.log(testData);

    //Now do tests on all of these cases
    var keys = Object.keys(testData);

    for (var i = 0; i < keys.length; i++) {
        var thisTest = testData[keys[i]];
        //One monolithic test    
        QUnit.test(thisTest.id, (function () {

            //Arrange
            var userName = thisTest.fullName;
            var masterPassword = thisTest.masterPassword;
            var siteTypeString = thisTest.siteType;
            var siteName = thisTest.siteName;
            var siteCounter = parseInt(thisTest.siteCounter);
            var result = thisTest.result;
            var id = thisTest.id;
            var mpw = new MPW();

            return function (assert) {
                //Act
                var password = mpw.mpw_core(userName, masterPassword, siteTypeString, siteName, siteCounter);

                //Assert
                assert.equal(password, result);

                console.log(id);
            };

        })());
    }
})();



