const path = require('path');

const shareBtnSelector = '.listenEngagement .sc-button-share';
const zcBtnSelector = `${shareBtnSelector} + button.zc-button-download`;

module.exports = {
  '@tags': ['track-page'],

  before: function (browser) {
    browser
      .url('https://soundcloud.com/lil-baby-4pf/drip-too-hard')
      .dismissCookiePolicyNotification();
  },

  after: function (browser) {
    browser.end();
  },

  'Adds a Download button to a SoundCloud track page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads the track when clicked': function (browser) {
    const trackPath = path.join(browser.globals.downloadDir, 'Drip Too Hard.mp3');
    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 2388853);
  },

  'Should be responsive and look similar to other buttons': function (browser) {
    browser
      .resizeWindow(800, 1080)
      .getElementSize(shareBtnSelector, function (size) {
        browser.globals.shareBtnSize = size;
      })
      .getElementSize(zcBtnSelector, function (size) {
        browser.globals.zcBtnSize = size;
      })
      .perform(function () {
        browser.assert.deepStrictEqual(browser.globals.zcBtnSize, browser.globals.shareBtnSize,
          'Should have the same size as other buttons.');
      });
  },

  'Should reappear when the page is refreshed': function (browser) {
    browser
      .refresh()
      .waitForElementVisible(zcBtnSelector);
  }
};
