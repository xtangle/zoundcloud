var TRACK_LIST_URL_PATTERNS = [ /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/ ];
var TRACK_LIST_URL = document.location.href;

if (TRACK_LIST_URL_PATTERNS.some(function (pattern) { return TRACK_LIST_URL.match(pattern); })) {

  var TRACK_LIST_SC_BASE_URL = 'https://soundcloud.com';
  var TRACK_LIST_INJECT_INTERVAL = 3000;
  var trackListTimeoutId;

  function onTrackListDownloadButtonClick(trackUrl) {
    return function() {
      chrome.runtime.sendMessage({
        message: 'startTrackDownload',
        tabUrl: trackUrl
      });
    }
  }

  function addTrackListDownloadButtons() {
    var trackListContainer = $("div[class~='listenDetails'] div[class~='trackList']").first();
    var trackItems = trackListContainer.find('ul > li > .trackItem');

    trackItems.each(function (index, trackItem) {
      var trackItemButtonGroup = $(trackItem).find('.soundActions > .sc-button-group').first();
      if (trackItemButtonGroup.children('.zc-button-download-small').length === 0) {
        var trackItemTitleLink = $(trackItem).find('.trackItem__content > .trackItem__trackTitle').first();
        var trackUrl = TRACK_LIST_SC_BASE_URL + trackItemTitleLink.attr('href');

        var downloadButton = $('<button>', {
          id: 'zcTrackListDownloadBtn-' + index,
          class: 'sc-button sc-button-small sc-button-responsive sc-button-icon zc-button-download-small',
          click: onTrackListDownloadButtonClick(trackUrl),
          title: 'Download this track'
        });

        var lastButtonInGroup = trackItemButtonGroup.children('button').last();
        lastButtonInGroup.before(downloadButton);
      }
    });
  }

  function removeTrackListDownloadButtons() {
    $('.zc-button-download-small').remove();
    clearTimeout(trackListTimeoutId);
  }

  function injectTrackListDownloadButtons() {
    if (document.location.href !== TRACK_LIST_URL) {
      removeTrackListDownloadButtons();
      return;
    }

    trackListTimeoutId = setTimeout(function () {
      addTrackListDownloadButtons();
      injectTrackListDownloadButtons();
    }, TRACK_LIST_INJECT_INTERVAL);
  }

  injectTrackListDownloadButtons();
}

