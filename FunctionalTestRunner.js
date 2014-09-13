/*!
 * Phantom Mochachino
 * http://doublenegative.com/phantom-mochachino
 *
 * Copyright 2014 Thomas Clowes <thomas@doublenegative.com>
 * Released under the MIT license
 */

var page = require("webpage").create();
var args = require('system').args;
var config = require('./config/phantom-mochachino-config.json');

//phantom - args immutable, so make a copy
var mochachinoArgs = args.slice();

var script = mochachinoArgs.shift();
var testFile = mochachinoArgs.shift();
var pageAddress = mochachinoArgs.shift();

var stateObj = [];
var argsToInject = mochachinoArgs;

var testStatus = 0;

if (typeof testFile === 'undefined') {
    console.error("Did not specify a test file");
    phantom.exit();
}

var injectTestDependencies = function() {
    page.injectJs(config.paths.mocha);
    page.injectJs(config.paths.mochachinoInterface);
    page.injectJs(config.paths.assertionLibrary);

    page.injectJs(config.paths.reporter);

    page.injectJs(config.paths.helpers);
    page.injectJs(config.paths.testBase + testFile);
}
 
page.open(config.siteUrl + pageAddress);

var pages = 0;

page.onCallback = function(data) {

    if (typeof data.executedItems !== 'undefined') {
        stateObj = data.executedItems;

        if (typeof data.differentPath !== 'undefined') {
            setTimeout(function() {
                page.reload();
            }, 1000);
        }
        
    } else if (typeof data.status !== 'undefined') {
        testStatus = data.status;
    } else if (typeof data.exit !== 'undefined') {
        phantom.exit(testStatus);
    } else {
        data.message && console.log(data.message);
    }
};

var hasNewUrl = true;

page.onUrlChanged = function(targetUrl) {
    hasNewUrl = true;
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    if (config.debug) {
      console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    }
};

page.onResourceRequested = function(requestData, networkRequest) {

};

page.onResourceError = function(resourceError) {
    if (config.debug) {
        console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
        console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    }
};

page.onResourceReceived = function(response) {
    if (config.debug) {
        console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
    }
};

page.onResourceTimeout = function(request) {
    if (config.debug) {
        console.log('Response (#' + request.id + '): ' + JSON.stringify(request));
    }
};


page.onLoadStarted = function(status) {
};

page.onLoadFinished = function(status) {

    if (hasNewUrl) {

        pages++;

        if (pages > 1) {
            console.log('//////////////////////////////////');
            console.log('///////// CHANGING PAGES /////////');
            console.log('//////////////////////////////////');
        }

        if (status !== 'success') {
            console.error("Failed to open", page.frameUrl);
            phantom.exit();
        }

        page.injectJs("mochachino.js");

        page.evaluate(function(stateObj, argsToInject) {
            window.mochachino.setup(stateObj);
            window.mochachino.injectArgs(argsToInject);
        }, stateObj, argsToInject);

        injectTestDependencies();

        page.evaluate(function() {
            window.mocha.run();
        });

        hasNewUrl = false;
    }
};