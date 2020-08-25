import global from './global';
export function test () {
  return typeof global.queueMicrotask === 'function';
}

export function install (func) {
  return function () {
    global.queueMicrotask(func);
  };
}
