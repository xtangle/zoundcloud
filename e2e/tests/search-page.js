const path = require('path');

module.exports = {
  '@tags': ['search-page'],

  before: function (browser) {
    browser
      .url('https://soundcloud.com/search?q=test')
      .dismissCookiePolicyNotification();
  },

  after: function (browser) {
    browser.end();
  },

  'Adds a Download button for every track or playlist item in the Everything list': function (browser) {
    browser
      .waitForElementVisible('.searchResultGroupHeading')
      .elements('css selector', '.searchList__item .sound__body', function (results) {
        browser.globals.numSoundItemsInitial = results.value.length;
      })
      .elements('css selector', '.searchList__item .sound__body .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtnsInitial = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numSoundItemsInitial > 1,
          `Number of track or playlist items loaded (${browser.globals.numSoundItemsInitial}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtnsInitial, browser.globals.numSoundItemsInitial,
          'Should add a Download button for every track or playlist item in the list.');
      });
  },

  'Continues adding Download buttons as more items are loaded into the list': function (browser) {
    browser
      .loadMoreItemsIntoList('.searchList .searchList__item:last-of-type')
      .elements('css selector', '.searchList__item .sound__body', function (results) {
        browser.globals.numSoundItemsFinal = results.value.length;
      })
      .elements('css selector', '.searchList__item .sound__body .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtnsFinal = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numSoundItemsFinal > browser.globals.numSoundItemsInitial,
          `Number of track or playlist items loaded (${browser.globals.numSoundItemsFinal}) `
          + `should be more than initial (${browser.globals.numSoundItemsInitial}).`);
        browser.assert.strictEqual(browser.globals.numZcBtnsFinal, browser.globals.numSoundItemsFinal,
          'Should add a Download button for every track or playlist item in the list.');
      });
  },

  'Adds a Download button for every track in the SoundCloud Go+ tracks list': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-nav-item\')]//a[contains(text(),\'SoundCloud Go+ tracks\')]')
      .useCss()
      .waitForElementVisible('.searchPremiumContentHeader')
      .elements('css selector', '.searchList__item', function (results) {
        browser.globals.numTracks = results.value.length;
      })
      .elements('css selector', '.searchList__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtns = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numTracks > 1,
          `Number of tracks loaded (${browser.globals.numTracks}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtns, browser.globals.numTracks,
          'Should add a Download button for every track in the list.');
      });
  },

  'Adds a Download button for every track in the Tracks list': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-nav-item\')]//a[contains(text(),\'Tracks\')]')
      .useCss()
      .waitForElementVisible('.searchResultGroupHeading')
      .elements('css selector', '.searchList__item', function (results) {
        browser.globals.numTracks = results.value.length;
      })
      .elements('css selector', '.searchList__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtns = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numTracks > 1,
          `Number of tracks loaded (${browser.globals.numTracks}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtns, browser.globals.numTracks,
          'Should add a Download button for every track in the list.');
      });
  },

  'Downloads the track when the Download button in the list is clicked': function (browser) {
    const trackPath = path.join(browser.globals.downloadDir, '07 Lil Baby & Marlo- Time After Time Ft. Tk Kravitz [Prod. By Quay Global].mp3');
    browser
      .setValue('input[type="search"]', ['07 Lil Baby & Marlo- Time After Time Ft. Tk Kravitz [Prod. By Quay Global]', browser.Keys.ENTER])
      .pause(1000) // wait for search to initiate
      .waitForElementVisible('.searchResultGroupHeading')
      .click('.searchList__item button.zc-button-download')
      .assert.fileDownloaded(trackPath)
      .verify.fileHasSize(trackPath, 3360581)
      .clearValue('input[type="search"]')
      .setValue('input[type="search"]', ['test', browser.Keys.ENTER]) // reset search back to 'test'
  },

  'Adds a Download button for every album in the Albums list': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-nav-item\')]//a[contains(text(),\'Albums\')]')
      .useCss()
      .waitForElementVisible('.searchResultGroupHeading')
      .elements('css selector', '.searchList__item', function (results) {
        browser.globals.numAlbums = results.value.length;
      })
      .elements('css selector', '.searchList__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtns = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numAlbums > 1,
          `Number of albums loaded (${browser.globals.numAlbums}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtns, browser.globals.numAlbums,
          'Should add a Download button for every album in the list.');
      });
  },

  'Adds a Download button for every playlist in the Playlists list': function (browser) {
    browser
      .useXpath()
      .click('//*[contains(@class,\'g-nav-item\')]//a[contains(text(),\'Playlists\')]')
      .useCss()
      .waitForElementVisible('.searchResultGroupHeading')
      .elements('css selector', '.searchList__item', function (results) {
        browser.globals.numPlaylists = results.value.length;
      })
      .elements('css selector', '.searchList__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtns = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numPlaylists > 1,
          `Number of playlists loaded (${browser.globals.numPlaylists}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtns, browser.globals.numPlaylists,
          'Should add a Download button for every playlist in the list.');
      });
  },

  'Downloads the playlist when the Download button in the list is clicked': function (browser) {
    const playlistDir = path.join(browser.globals.downloadDir, 'xtangle - Zqc9JceJT11d27T3ukAM');
    const track1Path = path.join(playlistDir, 'STOOPID (Feat. Bobby Shmurda).mp3');
    const track2Path = path.join(playlistDir, 'Lil Peep & XXXTENTACION - Falling Down.mp3');
    browser
      .setValue('input[type="search"]', ['xtangle Zqc9JceJT11d27T3ukAM', browser.Keys.ENTER])
      .pause(1000) // wait for search to initiate
      .waitForElementVisible('.searchResultGroupHeading')
      .click('.searchList__item button.zc-button-download')
      .assert.fileDownloaded(track1Path)
      .verify.fileHasSize(track1Path, 2489082)
      .assert.fileDownloaded(track2Path)
      .verify.fileHasSize(track2Path, 3215457);
  }
};
