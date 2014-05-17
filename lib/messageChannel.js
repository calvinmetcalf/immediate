'use strict';

exports.test = function () {
  if (typeof window !== 'object' || window.setImmediate) {
    // we can only get here in IE10
    // which doesn't handel postMessage well
    return false;
  }
  return typeof window.MessageChannel !== 'undefined';
};

exports.install = function (func) {
  var channel = new window.MessageChannel();
  channel.port1.onmessage = func;
  return function () {
    channel.port2.postMessage(0);
  };
};