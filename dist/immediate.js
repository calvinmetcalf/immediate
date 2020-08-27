(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.immediate = factory());
}(this, (function () { 'use strict';

  /* globals self, window */
  var Global = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {};

  function test() {
    // Don't get fooled by e.g. browserify environments.
    return typeof Global.process !== 'undefined' && !process.browser;
  }
  function install(func) {
    return function () {
      process.nextTick(func);
    };
  }

  var _nextTick = {
    __proto__: null,
    test: test,
    install: install
  };

  function test$1() {
    return typeof Global.queueMicrotask === 'function';
  }
  function install$1(func) {
    return function () {
      Global.queueMicrotask(func);
    };
  }

  var queueMicrotask = {
    __proto__: null,
    test: test$1,
    install: install$1
  };

  //license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
  //https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js

  var Mutation = Global.MutationObserver || Global.WebKitMutationObserver;
  function test$2() {
    return Mutation;
  }
  function install$2(handle) {
    var called = 0;
    var observer = new Mutation(handle);
    var element = Global.document.createTextNode('');
    observer.observe(element, {
      characterData: true
    });
    return function () {
      element.data = called = ++called % 2;
    };
  }

  var mutation = {
    __proto__: null,
    test: test$2,
    install: install$2
  };

  function test$3() {
    if (Global.setImmediate) {
      // we can only get here in IE10
      // which doesn't handel postMessage well
      return false;
    }

    return typeof Global.MessageChannel !== 'undefined';
  }
  function install$3(func) {
    var channel = new Global.MessageChannel();
    channel.port1.onmessage = func;
    return function () {
      channel.port2.postMessage(0);
    };
  }

  var messageChannel = {
    __proto__: null,
    test: test$3,
    install: install$3
  };

  function test$4() {
    return 'document' in Global && 'onreadystatechange' in Global.document.createElement('script');
  }
  function install$4(handle) {
    return function () {
      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var scriptEl = Global.document.createElement('script');

      scriptEl.onreadystatechange = function () {
        handle();
        scriptEl.onreadystatechange = null;
        scriptEl.parentNode.removeChild(scriptEl);
        scriptEl = null;
      };

      Global.document.documentElement.appendChild(scriptEl);
      return handle;
    };
  }

  var stateChange = {
    __proto__: null,
    test: test$4,
    install: install$4
  };

  function test$5() {
    return true;
  }
  function install$5(t) {
    return function () {
      setTimeout(t, 0);
    };
  }

  var timeout = {
    __proto__: null,
    test: test$5,
    install: install$5
  };

  var types;

  {
    types = [_nextTick, queueMicrotask, mutation, messageChannel, stateChange, timeout];
  }

  var draining;
  var currentQueue;
  var queueIndex = -1;
  var queue = [];
  var scheduled = false;

  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }

    draining = false;

    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }

    if (queue.length) {
      nextTick();
    }
  } //named nextTick for less confusing stack traces


  function nextTick() {
    if (draining) {
      return;
    }

    scheduled = false;
    draining = true;
    var len = queue.length;
    var timeout = setTimeout(cleanUpNextTick);

    while (len) {
      currentQueue = queue;
      queue = [];

      while (currentQueue && ++queueIndex < len) {
        currentQueue[queueIndex].run();
      }

      queueIndex = -1;
      len = queue.length;
    }

    currentQueue = null;
    queueIndex = -1;
    draining = false;
    clearTimeout(timeout);
  }

  var scheduleDrain;
  var i = -1;
  var len = types.length;

  while (++i < len) {
    if (types[i] && types[i].test && types[i].test()) {
      scheduleDrain = types[i].install(nextTick);
      break;
    }
  } // v8 likes predictible objects


  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }

  Item.prototype.run = function () {
    var fun = this.fun;
    var array = this.array;

    switch (array.length) {
      case 0:
        return fun();

      case 1:
        return fun(array[0]);

      case 2:
        return fun(array[0], array[1]);

      case 3:
        return fun(array[0], array[1], array[2]);

      default:
        return fun.apply(null, array);
    }
  };

  function immediate(task) {
    var args = new Array(arguments.length - 1);

    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }

    queue.push(new Item(task, args));

    if (!scheduled && !draining) {
      scheduled = true;
      scheduleDrain();
    }
  }

  return immediate;

})));
