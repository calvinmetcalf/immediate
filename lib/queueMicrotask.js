'use strict';
exports.test = function () {
  return typeof globalThis.queueMicrotask === 'function';
};

exports.install = function (func) {
  return function () {
    globalThis.queueMicrotask(func);
  };
};
