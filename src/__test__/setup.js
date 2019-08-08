global.fetch = require('jest-fetch-mock');

global.sleep = miliseconds => new Promise(
  (resolve) => {
    setTimeout(resolve, miliseconds);
  },
  () => { },
);
