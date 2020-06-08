'use strict';
exports.test = function () {
  return typeof global.Promise !== 'undefined';
};

exports.install = function (func) {
  return function () {
    global.Promise.resolve().then(func).catch(catchError);
  };
};

function catchError (error) {
  setTimeout(throwError, 0, error);
}

function throwError (error) {
  throw error;
}
