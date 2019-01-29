const path = require('path');

const shareBtnSelector = '.listenEngagement .sc-button-share';
const zcBtnSelector = `${shareBtnSelector} + button.zc-button-download`;

module.exports = {
  '@tags': ['track-page'],

  before(browser) {
    browser
      .url('https://soundcloud.com/lil-baby-4pf/drip-too-hard')
      .dismissCookiePolicyNotification();
  },

  after(browser) {
    browser.end();
  },

  'Adds a Download button to a SoundCloud track page': (browser) => {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads the track when clicked': (browser) => {
    const trackPath = path.join(browser.globals.downloadDir, 'Drip Too Hard.mp3');
    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 2403075);
  },

  'Should be responsive and look similar to other buttons': (browser) => {
    browser
      .resizeWindow(800, 1080)
      .getElementSize(shareBtnSelector, (size) => {
        browser.globals.shareBtnSize = size;
      })
      .getElementSize(zcBtnSelector, (size) => {
        browser.globals.zcBtnSize = size;
      })
      .perform(() => {
        browser.assert.deepStrictEqual(browser.globals.zcBtnSize, browser.globals.shareBtnSize,
          'Should have the same size as other buttons.');
      });
  },

  'Should reappear when the page is refreshed': (browser) => {
    browser
      .refresh()
      .waitForElementVisible(zcBtnSelector);
  },
};
