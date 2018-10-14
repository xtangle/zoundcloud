const path = require('path');

const buttonSelector = '.listenEngagement button.zc-button-download';

module.exports = {
  'Adds a Download button to a SoundCloud song page': function(browser) {
    browser
      .url('https://soundcloud.com/lil-baby-4pf/drip-too-hard')
      .waitForElementVisible(buttonSelector)
      .assert.containsText(buttonSelector, 'Download')
      .click(buttonSelector)
      .assert.fileDownloaded(path.join(browser.globals.downloadDir, 'Drip Too Hard.mp3'), 2388853)
      .end();
  }
};
