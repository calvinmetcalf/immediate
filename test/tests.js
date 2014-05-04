var test = require('tape');
var immediate = require("../lib");

test("Handlers do execute", function (t) {
    immediate(function () {
        t.ok(true, 'handler executed');
        t.end();
    });
});

test("Handlers do not execute in the same event loop turn as the call to `setImmediate`", function (t) {
    var handlerCalled = false;
    function handler() {
        handlerCalled = true;
        t.ok(true, 'handler called');
        t.end();
    }

    immediate(handler);
    t.notOk(handlerCalled, 'shouldn\'t be called yet');
});

test("passes through an argument to the handler", function (t) {
    var expectedArg = { expected: true };

    function handler(actualArg) {
        t.equal(actualArg, expectedArg);
        t.end();
    }

    immediate(handler, expectedArg);
});

test("passes through two arguments to the handler", function (t) {
    var expectedArg1 = { arg1: true };
    var expectedArg2 = { arg2: true };

    function handler(actualArg1, actualArg2) {
        t.equal(actualArg1, expectedArg1);
        t.equal(actualArg2, expectedArg2);
        t.end();
    }

    immediate(handler, expectedArg1, expectedArg2);
});


test("big test", function (t) {
    //mainly for optimizition testing
    var i = 1000;
    function doStuff() {
        i--;
        if(!i) {
            t.ok(true, 'big one works');
            t.end();
        } else {
            immediate(doStuff);
        }
    }
    immediate(doStuff);
});
if (process.browser && typeof Worker !== 'undefined') {
  test("worker", function (t) {
    var worker = new Worker('./test/worker.js');
    worker.onmessage = function (e) {
      t.equal(e.data, 'pong');
      t.end();
    };
    worker.postMessage('ping');
  });
}