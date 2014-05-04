'use strict';
var types = [
  require('./nextTick'),
  require('./mutation'),
  require('./postMessage'),
  require('./messageChannel'),
  require('./stateChange'),
  require('./timeout')
];
var Queue = require('./queue');
var handlerQueue = new Queue(1024);
function drainQueue() {
  var task;
  while ((task = handlerQueue.shift())) {
    task();
  }
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
  if (handlerQueue.push(nTask) === 1) {
    nextTick(drainQueue);
  }
};
