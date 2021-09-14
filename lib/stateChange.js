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