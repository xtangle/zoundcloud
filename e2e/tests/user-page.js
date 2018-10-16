const path = require('path');

const zcBtnSelector = '.userInfoBar .sc-button-share + button.zc-button-download';

module.exports = {
  before: function (browser) {
    browser
      .url('https://soundcloud.com/user-812520823')
      .dismissCookiePolicyNotification()
  },

  'Adds a Download button to a SoundCloud user page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads all songs posted by the user when clicked': function (browser) {
    const userDir = path.join(browser.globals.downloadDir, 'TEST USER');
    const song1Path = path.join(userDir, 'BlueGlass Test.mp3');
    const song2Path = path.join(userDir, 'Country Test.mp3');
    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(song1Path)
      .verify.fileHasSize(song1Path, 356790)
      .assert.fileDownloaded(song2Path)
      .verify.fileHasSize(song2Path, 386042);
  },

  'Adds a Download button for every item posted by the user in the All tab': function (browser) {
    browser
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(3, result.value.length, 'Should add a download button for every item posted by the user');
      });
  },

  'Downloads the playlist when the Download button in the list is clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'TEST USER - Chapter Test');
    const song1Path = path.join(playlistDir, 'BlueGlass Test.mp3');
    const song2Path = path.join(playlistDir, 'Country Test.mp3');
    browser
      .click('.userMain .soundList__item div[aria-label="Playlist: Chapter Test by TEST USER"] button.zc-button-download')
      .assert.fileDownloaded(song1Path)
      .verify.fileHasSize(song1Path, 356789)
      .assert.fileDownloaded(song2Path)
      .verify.fileHasSize(song2Path, 386041);
  },

  'Downloads the song when the Download button in the list is clicked': function (browser) {
    const songPath = path.join(browser.globals.downloadDir, 'Country Test.mp3');
    browser
      .click('.userMain .soundList__item:last-of-type button.zc-button-download')
      .assert.fileDownloaded(songPath)
      .verify.fileHasSize(songPath, 386042)
  },

  'Adds a Download button for every track posted by the user in the Tracks tab': function (browser) {
    browser
      .useXpath()
      .click("//*[contains(@class,'g-tabs-item')]//a[contains(text(),'Tracks')]")
      .useCss()
      .waitForElementVisible('.userMain .soundList')
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(2, result.value.length, 'Should add a download button for every track posted by the user');
      })
  },

  'Adds a Download button for every playlist posted by the user in the Playlists tab': function (browser) {
    browser
      .useXpath()
      .click("//*[contains(@class,'g-tabs-item')]//a[contains(text(),'Playlists')]")
      .useCss()
      .waitForElementVisible('.userMain .soundList')
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(1, result.value.length, 'Should add a download button for every playlist posted by the user');
      })
      .end();
  }
};
