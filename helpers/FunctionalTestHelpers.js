/*!
 * Phantom Mochachino
 * http://doublenegative.com/phantom-mochachino
 *
 * Copyright 2014 Thomas Clowes <thomas@doublenegative.com>
 * Released under the MIT license
 */

//Helper for asynchronous tests
//Adapted from the example within the PhantomJS source code 
//https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
function waitFor(testFx, onReady, timeOutMillis, onTimeout) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    typeof(onTimeout) === "string" ? eval(onTimeout) : onTimeout();
                    clearInterval(interval);
                    //phantom.exit(1);
                } else {
                    clearInterval(interval); //< Stop this interval
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                }
            }
        }, 250); //< repeat check every 250ms
};


// Phantom has issues with jQuery for some things.
// You can dispatch your own click event using this.
function click(el){
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        0, 0, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    el.dispatchEvent(ev);
}

//Random string helper
function randomString() { var s=Math.random().toString(36).slice(2); return s.length===16 ? s : randomString(); }

//Helpers for manipulating React components
function changeReactiveInput(elementId, newValue) {
    var TestUtils = PJLib.React.addons.TestUtils;

    var input = TestUtils.findRenderedDOMComponentWithProp(r, 'id', elementId);

    $("#" + elementId).val(newValue);
    TestUtils.Simulate.change(input);
}

function clickReactiveButton(elementId) {
    var TestUtils = PJLib.React.addons.TestUtils;
    var button = TestUtils.findRenderedDOMComponentWithProp(r, 'id', elementId);

    TestUtils.Simulate.click(button);
}