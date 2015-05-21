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
    t.notOk(handlerCalled);
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

test('test errors', function (t) {
  t.plan(7);
  var order = 0;
  process.once('uncaughtException', function(err) {
      t.ok(true, err.message);
      t.equals(2, order++, 'error is third');
      immediate(function () {
        t.equals(5, order++, 'schedualed in error is last');
      });
  });
  immediate(function (num1, num2) {
    t.equals(num1, order++, 'first one works');
    immediate(function (num) {
      t.equals(num, order++, 'recursive one is 4th');
    }, num2);
  }, 0, 4);
  immediate(function () {
    t.equals(1, order++, 'second one starts');
    throw(new Error('an error is thrown'));
  });
  immediate(function () {
    t.equals(3, order++, '3rd schedualed happens after the error');
  });
});
