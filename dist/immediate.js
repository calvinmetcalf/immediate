(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.immediate = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
(function (global){
'use strict';
var types = [
  _dereq_('./nextTick'),
  _dereq_('./queueMicrotask'),
  _dereq_('./mutation.js'),
  _dereq_('./messageChannel'),
  _dereq_('./stateChange'),
  _dereq_('./timeout')
];
var draining;
var currentQueue;
var queueIndex = -1;
var queue = [];
var scheduled = false;

var globalObject;
if(typeof window!=="undefined") {
  globalObject=window;
} else if(typeof global!=="undefined") {
  globalObject=global;
} else if(typeof self!=="undefined") {
  globalObject=self;
} else {
  globalObject=this;
}


function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    nextTick();
  }
}

//named nextTick for less confusing stack traces
function nextTick() {
  if (draining) {
    return;
  }
  scheduled = false;
  draining = true;
  var len = queue.length;
  var timeout = setTimeout(cleanUpNextTick);
  while (len) {
    currentQueue = queue;
    queue = [];
    while (currentQueue && ++queueIndex < len) {
      currentQueue[queueIndex].run();
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  queueIndex = -1;
  draining = false;
  clearTimeout(timeout);
}
var scheduleDrain;
var i = -1;
var len = types.length;
while (++i < len) {
  if (types[i] && types[i].test && types[i].test(globalObject)) {
    scheduleDrain = types[i].install(nextTick, globalObject);
    break;
  }
}
// v8 likes predictible objects
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
Item.prototype.run = function () {
  var fun = this.fun;
  var array = this.array;
  switch (array.length) {
  case 0:
    return fun();
  case 1:
    return fun(array[0]);
  case 2:
    return fun(array[0], array[1]);
  case 3:
    return fun(array[0], array[1], array[2]);
  default:
    return fun.apply(null, array);
  }

};
module.exports = immediate;
function immediate(task) {
  var args = new Array(arguments.length - 1);
  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }
  queue.push(new Item(task, args));
  if (!scheduled && !draining) {
    scheduled = true;
    scheduleDrain();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./messageChannel":2,"./mutation.js":3,"./nextTick":7,"./queueMicrotask":4,"./stateChange":5,"./timeout":6}],2:[function(_dereq_,module,exports){
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
},{}],3:[function(_dereq_,module,exports){
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
},{}],4:[function(_dereq_,module,exports){
'use strict';
exports.test = function (globalObject) {
  return typeof globalObject.queueMicrotask === 'function';
};

exports.install = function (func, globalObject) {
  return function () {
    globalObject.queueMicrotask(func);
  };
};

},{}],5:[function(_dereq_,module,exports){
'use strict';

exports.test = function (globalObject) {
  return 'document' in globalObject && 'onreadystatechange' in globalObject.document.createElement('script');
};

exports.install = function (handle, globalObject) {
  return function () {

    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
    var scriptEl = globalObject.document.createElement('script');
    scriptEl.onreadystatechange = function () {
      handle();

      scriptEl.onreadystatechange = null;
      scriptEl.parentNode.removeChild(scriptEl);
      scriptEl = null;
    };
    globalObject.document.documentElement.appendChild(scriptEl);

    return handle;
  };
};
},{}],6:[function(_dereq_,module,exports){
'use strict';
exports.test = function () {
  return true;
};

exports.install = function (t) {
  return function () {
    setTimeout(t, 0);
  };
};
},{}],7:[function(_dereq_,module,exports){

},{}]},{},[1])(1)
});
