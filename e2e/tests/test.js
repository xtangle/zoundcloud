module.exports = {
  'Loads Download button on SoundCloud song page': function(browser) {
    browser
      .url('https://soundcloud.com/lil-baby-4pf/drip-too-hard')
      .waitForElementVisible('.listenEngagement', 10000)
      .verify.visible('button.zc-button-download')
      .saveScreenshot('e2e/output/song-page-test.png')
      .end();
  }
};
