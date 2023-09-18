'use strict';

exports.test = function () {
  if (globalThis.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof globalThis.MessageChannel !== 'undefined';
};

exports.install = function (func) {
  var channel = new globalThis.MessageChannel();
  channel.port1.onmessage = func;
  return function () {
    channel.port2.postMessage(0);
  };
};