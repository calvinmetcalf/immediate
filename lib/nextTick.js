'use strict';
exports.test = function () {
  // Don't get fooled by e.g. browserify environments.
  // Some environments would define process.env.NODE_ENV = 'development', e.g. vite
  return (typeof process !== 'undefined') && (typeof process.nextTick !== 'undefined') && !process.browser;
};

exports.install = function (func) {
  return function () {
    process.nextTick(func);
  };
};
