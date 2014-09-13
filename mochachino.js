/*!
 * Phantom Mochachino
 * http://doublenegative.com/phantom-mochachino
 *
 * Copyright 2014 Thomas Clowes <thomas@doublenegative.com>
 * Released under the MIT license
 */


function Mochachino() {
	this.executedItems = [];
	this.isChanging = false;
    this.pageChanges = [];
    this.injectedArgs = [];
}

Mochachino.prototype.shouldWeContinue = function(testTitle) {
    if (this.executedItems.indexOf(testTitle) > -1 || this.isChanging) {
    	return false;
    }

    return true;
}

Mochachino.prototype.logExecution = function(testTitle) {
    this.executedItems.push(testTitle);
}

Mochachino.prototype.exit = function() {
	window.callPhantom({ exit: true });
}

Mochachino.prototype.logPageChange = function(testTitle) {
    this.pageChanges.push(testTitle);
}

Mochachino.prototype.willChangePages = function() {
	this.isChanging = true;
}

Mochachino.prototype.pageWillChange = function() {
	window.callPhantom({ executedItems: this.executedItems });
}

Mochachino.prototype.testDifferentPaths = function() {
	window.callPhantom({ executedItems: this.executedItems, differentPath: true});
}

var mochachino = new Mochachino();

mochachino.setup = function(executedItems) {
	var length = executedItems.length;

	this.executedItems = executedItems;
}

mochachino.injectArgs = function(args) {
    this.injectedArgs = args;
}

mochachino.final = function() {
    after(function() {
        setTimeout(function(){
            mochachino.exit();
        }, 1000);
    });
}