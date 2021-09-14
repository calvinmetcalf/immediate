'use strict';
//based off rsvp https://github.com/tildeio/rsvp.js
//license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js

function getMutation(globalObject) {
  return globalObject.MutationObserver || globalObject.WebKitMutationObserver;
}


exports.test = function (globalObject) {
  return getMutation(globalObject);
};

exports.install = function (handle, globalObject) {
  var Mutation = getMutation(globalObject);
  var called = 0;
  var observer = new Mutation(handle);
  var element = globalObject.document.createTextNode('');
  observer.observe(element, {
    characterData: true
  });
  return function () {
    element.data = (called = ++called % 2);
  };
};