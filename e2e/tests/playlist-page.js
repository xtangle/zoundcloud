const path = require('path');

const zcBtnSelector = '.listenEngagement .sc-button-share + button.zc-button-download';
const trackItemSelector = '.listenDetails .trackList__item:last-of-type';

module.exports = {
  before: function (browser) {
    browser
      .url('https://soundcloud.com/xtangle/sets/test-playlist')
      .dismissCookiePolicyNotification()
  },

  'Adds a Download button to a SoundCloud playlist page': function (browser) {
    browser
      .waitForElementVisible(zcBtnSelector)
      .assert.containsText(zcBtnSelector, 'Download');
  },

  'Downloads all songs in the playlist when clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'xtangle - test playlist');
    // song 1: uses the download_url method, does not have a .mp3 file extension,
    // has cover art but won't get added as it's not an mp3 file,
    // original song title has '__FREE DOWNLOAD__' as suffix which should be removed
    const song1Path = path.join(playlistDir, 'Rather Be (Marimba Remix).m4a');
    // song 2: uses the stream_url method, does not have cover art
    const song2Path = path.join(playlistDir, '23. M2U - Blythe.mp3');
    // song 3: uses the a1_api method
    const song3Path = path.join(playlistDir, 'Ryuusei.mp3');
    // song 4: uses the stream_url method, has a long song title with weird characters
    // with some that are unsuitable for filenames, has cover art
    const song4Path = path.join(playlistDir, 'مهرجان _ رب الكون ميزنا بميزه _ حمو بيكا - علي قدوره - نور التوت - توزيع فيجو الدخلاوي 2019' + '.mp3');

    browser
      .click(zcBtnSelector)
      .assert.fileDownloaded(song1Path)
      .verify.fileHasSize(song1Path, 1392074)
      .assert.fileDownloaded(song2Path)
      .verify.fileHasSize(song2Path, 2189492)
      .assert.fileDownloaded(song3Path)
      .verify.fileHasSize(song3Path, 5099728)
      .assert.fileDownloaded(song4Path)
      .verify.fileHasSize(song4Path, 5551831);
  },

  'Adds a Download button to every item in the track list': function (browser) {
    browser
      .elements('css selector', '.listenDetails .trackList__item .sc-button-share + button.zc-button-download', function (result) {
        browser.assert.strictEqual(4, result.value.length, 'Should add a download button for every track item');
      })
      .assert.hidden(`${trackItemSelector} button.zc-button-download`, 'Download button is hidden on a track item')
      .moveToElement(trackItemSelector, 100, 20)
      .assert.visible(`${trackItemSelector} button.zc-button-download`, 'Download button is visible when hovering over a track item');
  },

  'Downloads the song when a Download button in the track list is clicked': function (browser) {
    const songPath = path.join(browser.globals.downloadDir, 'مهرجان _ رب الكون ميزنا بميزه _ حمو بيكا - علي قدوره - نور التوت - توزيع فيجو الدخلاوي 2019' + '.mp3');
    browser
      .click(`${trackItemSelector} button.zc-button-download`)
      .assert.fileDownloaded(songPath)
      .verify.fileHasSize(songPath, 5551832) // not sure where the extra byte comes from
      .end();
  }
};
