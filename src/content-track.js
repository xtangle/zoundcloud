var TRACK_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/(?:[^\/]+$)|(?:[^\/]+(?=(?:\?in=)).+$)/;
var TRACK_TAB_URL = document.location.href;

if (TRACK_TAB_URL.match(TRACK_URL_PATTERN)) {

  var TRACK_INJECT_INTERVAL = 1000;
  var TRACK_SOUND_ACTIONS_TOOLBAR_WAIT_BUFFER = 10;

  var trackTimeoutId;
  var stopInjectingTrackDownloadButton = false;
  var trackSoundActionsToolbarNotFoundCount = 0;

  function onTrackDownloadButtonClick() {
    chrome.runtime.sendMessage({
      message: 'startTrackDownload',
      tabUrl: TRACK_TAB_URL
    });
  }

  function addTrackDownloadButton() {
    var soundActionsToolbar = $("div[class~='listenEngagement'] div[class~='soundActions']").first();
    if (soundActionsToolbar.length === 0) {
      soundActionsToolbar = $('.soundActions.soundActions__medium').first();
    }
    if (soundActionsToolbar.length === 0) {
      if (trackSoundActionsToolbarNotFoundCount < TRACK_SOUND_ACTIONS_TOOLBAR_WAIT_BUFFER) {
        trackSoundActionsToolbarNotFoundCount++;
      } else {
        stopInjectingTrackDownloadButton = true;
      }
      return;
    }

    var downloadButton = $('<button>', {
      id: 'zcTrackDownloadBtn',
      class: 'sc-button sc-button-medium zc-button-download',
      click: onTrackDownloadButtonClick,
      title: 'Download this track'
    });

    var showLabelOnButton = soundActionsToolbar.find('.sc-button-responsive').length > 0;
    if (showLabelOnButton) {
      downloadButton.addClass('sc-button-responsive').text('Download');
    } else {
      downloadButton.addClass('sc-button-icon');
    }

    var soundActionToolbarChildren = soundActionsToolbar.children('div');
    var addSeparateContainer = soundActionToolbarChildren.length > 1 &&
      soundActionToolbarChildren.last().find('button').length > 0;

    if (addSeparateContainer) {
      var downloadButtonContainer = $("<div>", {
        id: 'zcTrackDownloadBtnContainer',
        class: 'sc-button-group'
      });
      downloadButtonContainer.append(downloadButton);
      soundActionsToolbar.append(downloadButtonContainer);
    } else {
      var buttonGroup = soundActionToolbarChildren.first();
      var lastButtonInGroup = buttonGroup.children('button').last();
      if (lastButtonInGroup.hasClass('sc-button-more')) {
        lastButtonInGroup.before(downloadButton);
      } else {
        buttonGroup.append(downloadButton);
      }
    }
  }

  function removeTrackDownloadButton() {
    $('#zcTrackDownloadBtn').remove();
    $('#zcTrackDownloadBtnContainer').remove();
    clearTimeout(trackTimeoutId);
  }

  function injectTrackDownloadButton() {
    if (document.location.href !== TRACK_TAB_URL || stopInjectingTrackDownloadButton) {
      removeTrackDownloadButton();
      return;
    }

    trackTimeoutId = setTimeout(function () {
      if ($('#zcTrackDownloadBtn').length === 0) {
        addTrackDownloadButton();
      }
      injectTrackDownloadButton();
    }, TRACK_INJECT_INTERVAL);
  }

  injectTrackDownloadButton();
}
