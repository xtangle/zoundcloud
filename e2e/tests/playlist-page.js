const path = require('path');

const zcBtnSelector = '.listenEngagement .sc-button-share + button.zc-button-download';
const trackItemSelector = '.listenDetails .trackList__item:last-of-type';

module.exports = {
  '@tags': ['playlist-page'],

  before: function (browser) {
    browser
      .url('https://soundcloud.com/xtangle/sets/test-playlist')
      .dismissCookiePolicyNotification();
  },

  'Adds a Download button to a SoundCloud playlist page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads all tracks in the playlist when clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'xtangle - test playlist');
    // track 1: uses the download_url method, does not have a .mp3 file extension,
    // has cover art but won't get added as it's not an mp3 file,
    // original track title has '__FREE DOWNLOAD__' as suffix which should be removed
    const track1Path = path.join(playlistDir, 'Rather Be (Marimba Remix).m4a');
    // track 2: uses the stream_url method, does not have cover art
    const track2Path = path.join(playlistDir, '23. M2U - Blythe.mp3');
    // track 3: uses the a1_api method
    const track3Path = path.join(playlistDir, 'Ryuusei.mp3');
    // track 4: uses the stream_url method, has a long track title with weird characters
    // with some that are unsuitable for filenames, has cover art
    const track4Path = path.join(playlistDir, 'مهرجان _ رب الكون ميزنا بميزه _ حمو بيكا - علي قدوره - نور التوت - توزيع فيجو الدخلاوي 2019' + '.mp3');

    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(track1Path)
      .verify.fileHasSize(track1Path, 1392074)
      .assert.fileDownloaded(track2Path)
      .verify.fileHasSize(track2Path, 2189492)
      .assert.fileDownloaded(track3Path)
      .verify.fileHasSize(track3Path, 5099728)
      .assert.fileDownloaded(track4Path)
      .verify.fileHasSize(track4Path, 5551831);
  },

  'Adds a Download button for every item in the track list': function (browser) {
    browser
      .elements('css selector', '.listenDetails .trackList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(result.value.length, 4,
          'Should add a download button for every track item');
      })
      .assert.hidden(`${trackItemSelector} button.zc-button-download`, 'Download button is hidden on a track item')
      .moveToElement(trackItemSelector, 100, 20)
      .assert.visible(`${trackItemSelector} button.zc-button-download`, 'Download button is visible when hovering over a track item');
  },

  'Downloads the track when a Download button in the track list is clicked': function (browser) {
    const trackPath = path.join(browser.globals.downloadDir, 'مهرجان _ رب الكون ميزنا بميزه _ حمو بيكا - علي قدوره - نور التوت - توزيع فيجو الدخلاوي 2019' + '.mp3');
    browser
      .click(`${trackItemSelector} button.zc-button-download`)
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 5551832); // not sure where the extra byte comes from
  }
};
