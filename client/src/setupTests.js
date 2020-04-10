import React from "react";
// import { cleanup } from "@testing-library/react";

// localStorage mock for tests
const mockLocalStorage = () => {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    removeItem: function (key) {
      delete store[key];
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
  };
};

global.localStorage = mockLocalStorage();

beforeEach(() => {
  // Replacing the native history.pushState with a wrapper to sniff calls to
  // window.history.pushState
  const nativeHistoryPushState = window.history.pushState;
  window.history.pushState = function (state, title, url) {
    nativeHistoryPushState.apply(this, arguments);
    var event = new CustomEvent("pushState", { detail: { state, title, url } });
    window.dispatchEvent(event);
  };
});

// afterEach(() => {
//   // Unmounts React trees that were mounted with @testing-library/react's render.
//   cleanup();
// });
