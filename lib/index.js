'use strict';
var types = [
  require('./nextTick'),
  require('./postMessage'),
  require('./messageChannel'),
  require('./stateChange'),
  require('./timeout')
];
var draining;
var handlerQueue = [];
function drainQueue() {
  draining = true;
  var i, newQueue;
  var len = handlerQueue.length;
  while (len) {
    newQueue = handlerQueue;
    handlerQueue = [];
    i = -1;
    while (++i < len) {
      newQueue[i]();
    }
    len = handlerQueue.length;
  }
  draining = false;
}
var scheduleDrain;
var i = -1;
var len = types.length;
while (++ i < len) {
  if (types[i].test()) {
    scheduleDrain = types[i].install(drainQueue);
    break;
  }
}
module.exports = immediate;
function immediate(task) {
  var len, i, args;
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
  if ((len = handlerQueue.push(nTask)) === 1 && !draining) {
    scheduleDrain();
  }
  return len;
}
module.exports.clear = function (n) {
  if (n <= handlerQueue.length) {
    handlerQueue[n - 1] = function () {};
  }
  return this;
};
