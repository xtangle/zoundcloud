module.exports = {
  '@tags': ['charts-page'],

  before: function (browser) {
    browser
      .url('https://soundcloud.com/charts/top?genre=all-music&country=all-countries')
      .dismissCookiePolicyNotification();
  },

  'Adds a Download button for every track in the charts list': function (browser) {
    browser
      .elements('css selector', '.chartsMain .chartTracks__item', function (results) {
        browser.globals.numChartTracksInitial = results.value.length;
      })
      .elements('css selector', '.chartsMain .chartTracks__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtnsInitial = results.value.length;
      })
      .perform(function () {
        browser.assert.ok(browser.globals.numChartTracksInitial > 1,
          `Number of tracks loaded (${browser.globals.numChartTracksInitial}) should be more than 1.`);
        browser.assert.strictEqual(browser.globals.numZcBtnsInitial, browser.globals.numChartTracksInitial,
          'Should add a Download button for every track in the list.');
      });
  },

  'Continues adding Download buttons as more tracks are loaded into the list': function (browser) {
    browser
      .loadMoreItemsIntoList('.chartsMain .chartTracks__item:last-of-type')
      .elements('css selector', '.chartsMain .chartTracks__item', function (results) {
        browser.globals.numChartTracksFinal = results.value.length;
      })
      .elements('css selector', '.chartsMain .chartTracks__item .sc-button-share + button.zc-button-download', function (results) {
        browser.globals.numZcBtnsFinal = results.value.length;
      })
      .perform(function () {
        browser.assert.strictEqual(browser.globals.numChartTracksFinal, 50,
          `Number of tracks loaded (${browser.globals.numChartTracksFinal}) should be 50.`);
        browser.assert.strictEqual(browser.globals.numZcBtnsFinal, browser.globals.numChartTracksFinal,
          'Should add a Download button for every track in the list.');
      })
  }
};
