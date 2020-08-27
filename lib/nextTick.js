import global from './global';

export function test () {
  // Don't get fooled by e.g. browserify environments.
  return (typeof global.process !== 'undefined') && !process.browser;
}

export function install (func) {
  return function () {
    process.nextTick(func);
  };
}
