module.exports = {
  '@tags': ['discover-page'],

  before(browser) {
    browser
      .url('https://soundcloud.com/discover/sets/charts-top:all-music')
      .dismissCookiePolicyNotification();
  },

  after(browser) {
    browser.end();
  },

  'Adds a Download button for every track in the discover list': function (browser) {
    browser
      .waitForElementVisible('.systemPlaylistTrackList__item:first-of-type')
      .elements('css selector', '.systemPlaylistTrackList__item', (results) => {
        browser.globals.numDiscoverTracksInitial = results.value.length;
      })
      .elements('css selector', '.systemPlaylistTrackList__item'
        + ' .sc-button-share + button.zc-button-download', (results) => {
        browser.globals.numZcBtnsInitial = results.value.length;
      })
      .perform(() => {
        browser.assert.ok(browser.globals.numDiscoverTracksInitial > 1,
          `Number of tracks loaded (${browser.globals.numDiscoverTracksInitial}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtnsInitial, browser.globals.numDiscoverTracksInitial,
          'Should add a Download button for every track in the list.');
      });
  },
};
