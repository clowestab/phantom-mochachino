/*!
 * Phantom Mochachino
 * http://doublenegative.com/phantom-mochachino
 *
 * Copyright 2014 Thomas Clowes <thomas@doublenegative.com>
 * Released under the MIT license
 */

(function() {

    var color = Mocha.reporters.Base.color;

    function log() {

        var args = Array.apply(null, arguments);

        if (window.callPhantom) {
            window.callPhantom({ message: args.join(" ") });
        } else {
            console.log( args.join(" ") );
        }

    }

    var Reporter = function(runner){

        Mocha.reporters.Base.call(this, runner);

        var out = [];
        var stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }
        var runTests = [];

        runner.on('start', function() {
            stats.start = new Date;
        });

        runner.on('suite', function(suite) {
            stats.suites++;
            out.push([suite.title, "\n"]);
        });

        runner.on('test', function(test) {
            stats.tests++;
            runTests.push(test.title);
        });

        runner.on("pass", function(test) {

            if (mochachino.pageChanges.indexOf(test.title) != -1) {
                out.push(['Page Change']);
            }

            stats.passes++;
            if ('fast' == test.speed) {
                out.push([ color('checkmark', '  ✓ '), test.title, "\n" ]);
            } else {
                out.push([
                    color('checkmark', '  ✓ '),
                    test.title,
                    color(test.speed, test.duration + "ms"),
                    '\n'
                ]);
            }

        });

        runner.on('fail', function(test, err) {
            stats.failures++;
            out.push([ color('fail', '  × '), color('fail', test.title), ":\n    ", err ,"\n"]);
        });

        runner.on("end", function() {
            stats.end = new Date;
            stats.duration = new Date - stats.start;

            out.push([stats.tests, "tests ran in", stats.duration, "ms"]);
            out.push([ color('checkmark', stats.passes), "passed and", color('fail', stats.failures), "failed"]);
            out.push(['\n']);

            while (out.length) {
                log.apply(null, out.shift());
            }

            if (window.callPhantom) {
                var status = stats.failures > 0 ? 1 : 0;
                window.callPhantom({ status: status });
            }

        });

    };

    mocha.setup({
        ui: 'mochachino-bdd',
        ignoreLeaks: true,
        reporter: Reporter
    });

}());