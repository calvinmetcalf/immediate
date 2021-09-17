'use strict';

exports.test = function (globalObject) {
  if (globalObject.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof globalObject.MessageChannel !== 'undefined';
};

exports.install = function (func, globalObject) {
  var channel = new globalObject.MessageChannel();
  channel.port1.onmessage = func;
  return function () {
    channel.port2.postMessage(0);
  };
};