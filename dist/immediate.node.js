'use strict';

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
  return true;
}
function install$1(t) {
  return function () {
    setTimeout(t, 0);
  };
}

var timeout = {
  __proto__: null,
  test: test$1,
  install: install$1
};

var types;

{
  types = [_nextTick, timeout];
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

module.exports = immediate;
