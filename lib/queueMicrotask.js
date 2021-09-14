'use strict';
exports.test = function (globalObject) {
  return typeof globalObject.queueMicrotask === 'function';
};

exports.install = function (func, globalObject) {
  return function () {
    globalObject.queueMicrotask(func);
  };
};
