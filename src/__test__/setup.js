global.fetch = require('jest-fetch-mock');
require('../__mocks__/match_media');

global.sleep = miliseconds => new Promise(
  (resolve) => {
    setTimeout(resolve, miliseconds);
  },
  () => { },
);
