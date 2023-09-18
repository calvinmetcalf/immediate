(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.immediate = factory());
})(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var nextTick$1 = {};

	nextTick$1.test = function () {
	  // Don't get fooled by e.g. browserify environments.
	  return (typeof process !== 'undefined') && !process.browser;
	};

	nextTick$1.install = function (func) {
	  return function () {
	    process.nextTick(func);
	  };
	};

	var queueMicrotask = {};

	queueMicrotask.test = function () {
	  return typeof commonjsGlobal.queueMicrotask === 'function';
	};

	queueMicrotask.install = function (func) {
	  return function () {
	    commonjsGlobal.queueMicrotask(func);
	  };
	};

	var mutation = {};

	//based off rsvp https://github.com/tildeio/rsvp.js
	//license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
	//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js

	var Mutation = globalThis.MutationObserver || globalThis.WebKitMutationObserver;

	mutation.test = function () {
	  return Mutation;
	};

	mutation.install = function (handle) {
	  var called = 0;
	  var observer = new Mutation(handle);
	  var element = commonjsGlobal.document.createTextNode('');
	  observer.observe(element, {
	    characterData: true
	  });
	  return function () {
	    element.data = (called = ++called % 2);
	  };
	};

	var messageChannel = {};

	messageChannel.test = function () {
	  if (commonjsGlobal.setImmediate) {
	    // we can only get here in IE10
	    // which doesn't handel postMessage well
	    return false;
	  }
	  return typeof commonjsGlobal.MessageChannel !== 'undefined';
	};

	messageChannel.install = function (func) {
	  var channel = new commonjsGlobal.MessageChannel();
	  channel.port1.onmessage = func;
	  return function () {
	    channel.port2.postMessage(0);
	  };
	};

	var stateChange = {};

	stateChange.test = function () {
	  return 'document' in commonjsGlobal && 'onreadystatechange' in commonjsGlobal.document.createElement('script');
	};

	stateChange.install = function (handle) {
	  return function () {

	    // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	    // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	    var scriptEl = commonjsGlobal.document.createElement('script');
	    scriptEl.onreadystatechange = function () {
	      handle();

	      scriptEl.onreadystatechange = null;
	      scriptEl.parentNode.removeChild(scriptEl);
	      scriptEl = null;
	    };
	    commonjsGlobal.document.documentElement.appendChild(scriptEl);

	    return handle;
	  };
	};

	var timeout = {};

	timeout.test = function () {
	  return true;
	};

	timeout.install = function (t) {
	  return function () {
	    setTimeout(t, 0);
	  };
	};

	// const nextTickModule=require('./nextTick')
	// const queueMicrotaskModule=require('./queueMicrotask')
	// const mutationModule=require('./mutation')
	// const messageChannelModule=require('./messageChannel')
	// const stateChangeModule=require('./stateChange')
	// const timeoutModule=require('./timeout')

	var types = [
	  nextTick$1,
	  queueMicrotask,
	  mutation,
	  messageChannel,
	  stateChange,
	  timeout
	];

	// var types = [
	//   nextTickModule,
	//   queueMicrotaskModule,
	//   mutationModule,
	//   messageChannelModule,
	//   stateChangeModule,
	//   timeoutModule
	// ];

	var draining;
	var currentQueue;
	var queueIndex = -1;
	var queue = [];
	var scheduled = false;
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
	  if (types[i] && types[i].test && types[i].test()) {
	    scheduleDrain = types[i].install(nextTick);
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

	var lib = immediate;

	var index = /*@__PURE__*/getDefaultExportFromCjs(lib);

	return index;

}));
