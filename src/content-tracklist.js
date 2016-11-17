var TRACK_LIST_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var TRACK_LIST_URL = document.location.href;

if (TRACK_LIST_URL.match(TRACK_LIST_URL_PATTERN)) {

  var TRACK_LIST_SC_BASE_URL = 'https://soundcloud.com';
  var TRACK_LIST_INJECT_INTERVAL = 2000;
  var trackListTimeoutId;
  var trackListButtonIsLoaded = [];
  var trackListNumberOfButtonsLoaded = 0;

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
    if (trackListNumberOfButtonsLoaded >= trackItems.length) {
      return;
    }

    trackItems.each(function (index, trackItem) {
      if (!trackListButtonIsLoaded[index]) {
        var trackItemButtonGroup = $(trackItem).find('.soundActions > .sc-button-group').first();
        if (trackItemButtonGroup.children('.zc-button-download-small').length === 0) {
          var lastButtonInGroup = trackItemButtonGroup.children('button').last();
          var trackItemTitleLink = $(trackItem).find('.trackItem__content > .trackItem__trackTitle').first();
          var trackUrl = TRACK_LIST_SC_BASE_URL + trackItemTitleLink.attr('href');

          if (lastButtonInGroup.length > 0 && trackUrl) {
            var downloadButton = $('<button>', {
              id: 'zcTrackListDownloadBtn-' + index,
              class: 'sc-button sc-button-small sc-button-responsive sc-button-icon zc-button-download-small',
              click: onTrackListDownloadButtonClick(trackUrl),
              title: 'Download this track'
            });
            lastButtonInGroup.before(downloadButton);
            trackListButtonIsLoaded[index] = true;
            trackListNumberOfButtonsLoaded++;
          }
        }
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

