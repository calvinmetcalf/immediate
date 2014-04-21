importScripts('../dist/immediate.js');
self.onmessage =function (e) {
  if (e.data === 'ping') {
    immediate(function () {
      self.postMessage('pong');
    });
  }
};