'use strict';
export function test() {
  return true;
};

export function install(t) {
  return function () {
    setTimeout(t, 0);
  };
};
