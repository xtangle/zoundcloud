const path = require('path');

const shareBtnSelector = '.listenEngagement .sc-button-share';
const zcBtnSelector = `${shareBtnSelector} + button.zc-button-download`;

module.exports = {
  before: function (browser) {
    browser
      .url('https://soundcloud.com/lil-baby-4pf/drip-too-hard')
      .dismissCookiePolicyNotification()
  },

  'Adds a Download button to a SoundCloud song page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads the song when clicked': function (browser) {
    const songPath = path.join(browser.globals.downloadDir, 'Drip Too Hard.mp3');
    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(songPath)
      .verify.fileHasSize(songPath, 2388853);
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
        browser.assert.deepStrictEqual(browser.globals.shareBtnSize, browser.globals.zcBtnSize,
          `Should have the same size as other buttons.`);
      });
  },

  'Should reappear when the page is refreshed': function (browser) {
    browser
      .refresh()
      .waitForElementVisible(zcBtnSelector)
      .end();
  }
};
