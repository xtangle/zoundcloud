const path = require('path');

const zcBtnSelector = '.userInfoBar .sc-button-share + button.zc-button-download';

module.exports = {
  '@tags': ['user-page'],

  before: function (browser) {
    browser
      .url('https://soundcloud.com/user-812520823')
      .dismissCookiePolicyNotification();
  },

  after: function (browser) {
    browser.end();
  },

  'Adds a Download button to a SoundCloud user page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads all tracks posted by the user when clicked': function (browser) {
    const userDir = path.join(browser.globals.downloadDir, 'TEST USER');
    const track1Path = path.join(userDir, 'BlueGlass Test.mp3');
    const track2Path = path.join(userDir, 'Country Test.mp3');
    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(track1Path)
      .verify.fileHasSize(track1Path, 356790)
      .assert.fileDownloaded(track2Path)
      .verify.fileHasSize(track2Path, 386042);
  },

  'Adds a Download button for every item posted by the user in the All tab': function (browser) {
    browser
      .waitForElementVisible('.userMain .soundList__item:first-of-type')
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(result.value.length, 3,
          'Should add a download button for every item posted by the user');
      });
  },

  'Downloads the playlist when the Download button in the list is clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'TEST USER - Chapter Test');
    const track1Path = path.join(playlistDir, 'BlueGlass Test.mp3');
    const track2Path = path.join(playlistDir, 'Country Test.mp3');
    browser
      .click('.userMain .soundList__item div[aria-label="Playlist: Chapter Test by TEST USER"] button.zc-button-download')
      .assert.fileDownloaded(track1Path)
      .verify.fileHasSize(track1Path, 356789)
      .assert.fileDownloaded(track2Path)
      .verify.fileHasSize(track2Path, 386041);
  },

  'Downloads the track when the Download button in the list is clicked': function (browser) {
    const trackPath = path.join(browser.globals.downloadDir, 'Country Test.mp3');
    browser
      .click('.userMain .soundList__item:last-of-type button.zc-button-download')
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 386042);
  },

  'Adds a Download button for every track posted by the user in the Tracks tab': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-tabs-item\')]//a[contains(text(),\'Tracks\')]')
      .useCss()
      .waitForElementVisible('.userMain .soundList__item:first-of-type')
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(result.value.length, 2,
          'Should add a download button for every track posted by the user');
      });
  },

  'Adds a Download button for every playlist posted by the user in the Playlists tab': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-tabs-item\')]//a[contains(text(),\'Playlists\')]')
      .useCss()
      .waitForElementVisible('.userMain .soundList__item:first-of-type')
      .elements('css selector', '.userMain .soundList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(result.value.length, 1,
          'Should add a download button for every playlist posted by the user');
      });
  }
};
