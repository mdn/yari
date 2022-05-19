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

// @ts-expect-error ts-migrate(2739) FIXME: Type '{ getItem: (key: any) => any; removeItem: (k... Remove this comment to see the full error message
global.localStorage = mockLocalStorage();
