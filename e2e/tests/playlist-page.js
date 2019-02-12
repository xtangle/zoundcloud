const path = require('path');

const zcBtnSelector = '.listenEngagement .sc-button-share + button.zc-button-download';
const trackItemSelector = '.listenDetails .trackList__item:nth-of-type(3)';

module.exports = {
  '@tags': ['playlist-page'],

  before(browser) {
    browser
      .url('https://soundcloud.com/xtangle/sets/test-playlist')
      .dismissCookiePolicyNotification();
  },

  after(browser) {
    browser.end();
  },

  'Adds a Download button to a SoundCloud playlist page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads all tracks in the playlist when clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'xtangle - test playlist');
    // track 1: uses the download_url method, does not have a .mp3 file extension
    // (but should download in mp3 format anyways because of 'always download mp3' option enabled by default),
    // has cover art, and original track title has '__FREE DOWNLOAD__' as a suffix which should be removed
    const track1Path = path.join(playlistDir, 'Rather Be (Marimba Remix).mp3');
    // track 2: uses the stream_url method, does not have cover art
    const track2Path = path.join(playlistDir, '23. M2U - Blythe.mp3');
    // track 3: uses the a1_api method
    const track3Path = path.join(playlistDir, 'Ryuusei.mp3');
    // track 4: has a weird problem where song cannot be downloaded due to
    // 'Illegal invocation: Function must be called on an object of type StorageArea',
    // see https://github.com/xtangle/zoundcloud/issues/17
    const track4Path = path.join(playlistDir, 'Maggie Rogers - Alaska (Tycho Remix).mp3');

    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(track1Path)
      .verify.fileHasSize(track1Path, 523662)
      .assert.fileDownloaded(track2Path)
      .verify.fileHasSize(track2Path, 2189492)
      .assert.fileDownloaded(track3Path)
      .verify.fileHasSize(track3Path, 5099728)
      .assert.fileDownloaded(track4Path)
      .verify.fileHasSize(track4Path, 3482186);
  },

  'Adds a Download button for every item in the track list': function (browser) {
    browser
      .elements('css selector', '.listenDetails .trackList__item'
        + ' .sc-button-share + button.zc-button-download', (result) => {
        browser.assert.strictEqual(result.value.length, 4,
          'Should add a download button for every track item');
      })
      .assert.hidden(`${trackItemSelector} button.zc-button-download`, 'Download button is hidden on a track item')
      .moveToElement(trackItemSelector, 100, 20)
      .assert.visible(`${trackItemSelector} button.zc-button-download`,
        'Download button is visible when hovering over a track item');
  },

  'Downloads the track when a Download button in the track list is clicked': function (browser) {
    const trackPath = path.join(browser.globals.downloadDir, 'Ryuusei.mp3');
    browser
      .click(`${trackItemSelector} button.zc-button-download`)
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 5099729); // not sure where the extra byte comes from
  },
};
