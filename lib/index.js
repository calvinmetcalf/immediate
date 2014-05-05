'use strict';
var types = [
  require('./nextTick'),
  require('./mutation'),
  require('./postMessage'),
  require('./messageChannel'),
  require('./stateChange'),
  require('./timeout')
];
var draining;
var cur = 0;
var handlerQueue = new Array(1024);
function drainQueue() {
  draining = true;
  var len = cur;
  cur = 0;
  var i, newQueue;
  while (len) {
    newQueue = handlerQueue;
    handlerQueue = new Array(1024);
    i = -1;
    while (++i < len) {
      newQueue[i]();
    }
    len = cur;
    cur = 0;
  }
  draining = false;
}
var nextTick;
var i = -1;
var len = types.length;
while (++ i < len) {
  if (types[i].test()) {
    nextTick = types[i].install(drainQueue);
    break;
  }
}
module.exports = function (task) {
  var i, args;
  var nTask = task;
  if (arguments.length > 1 && typeof task === 'function') {
    args = new Array(arguments.length - 1);
    i = 0;
    while (++i < arguments.length) {
      args[i - 1] = arguments[i];
    }
    nTask = function () {
      task.apply(undefined, args);
    };
  }
  handlerQueue[cur++] = nTask;
  if (cur === 1 && !draining) {
    nextTick(drainQueue);
  }
  return cur;
};
module.exports.clear = function (n) {
  if (n <= cur) {
    handlerQueue[n - 1] = function () {};
  }
  return this;
};
