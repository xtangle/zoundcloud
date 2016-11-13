var PLAYLIST_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var PLAYLIST_TAB_URL = document.location.href;

if (PLAYLIST_TAB_URL.match(PLAYLIST_URL_PATTERN)) {

  var TIMEOUT_INTERVAL = 1000;
  var isDownloading;
  var timeoutId;
  var showLabelOnButton;

  function stopDownload() {
    chrome.runtime.sendMessage({message: "stopPlaylistDownload"});
  }

  function downloadPlaylist() {
    chrome.runtime.sendMessage({
      message: 'startPlaylistDownload',
      tabUrl: PLAYLIST_TAB_URL
    });
    setDownloadStartedState();
  }

  function setDownloadStartedState() {
    isDownloading = true;
    var downloadButton = $('#zcDownloadBtn');
    downloadButton
      .removeClass('zc-button-download')
      .addClass('zc-button-stop')
      .addClass('sc-button-active')
      .prop('title', 'Stop downloading playlist');
    if (showLabelOnButton) {
      downloadButton.text('Stop Download');
    }
  }

  function setDownloadStoppedState() {
    isDownloading = false;
    var downloadButton = $('#zcDownloadBtn');
    downloadButton
      .removeClass('sc-button-active')
      .removeClass('zc-button-stop')
      .addClass('zc-button-download')
      .prop('title', 'Download this playlist');
    if (showLabelOnButton) {
      downloadButton.text('Download');
    }
  }

  function onDownloadButtonClick() {
    if (isDownloading) {
      stopDownload();
    } else {
      downloadPlaylist();
    }
  }

  function getInitialDownloadState() {
    chrome.runtime.sendMessage({message: "getPlaylistDownloadState"}, function (response) {
      if (response.isDownloadingPlaylist) {
        setDownloadStartedState();
      } else {
        setDownloadStoppedState();
      }
    });
  }

  function addDownloadButton() {
    var downloadButton = $('<button>', {
      id: 'zcDownloadBtn',
      class: 'sc-button sc-button-medium',
      click: onDownloadButtonClick
    });

    var soundActionsToolbar = $("div[class~='listenEngagement'] div[class~='soundActions']").first();
    showLabelOnButton = soundActionsToolbar.find('.sc-button-responsive').length > 0;

    if (showLabelOnButton) {
      downloadButton.addClass('sc-button-responsive');
    } else {
      downloadButton.addClass('sc-button-icon');
    }

    var soundActionToolbarChildren = soundActionsToolbar.children('div');
    var addSeparateContainer = soundActionToolbarChildren.length > 1 &&
      soundActionToolbarChildren.last().find('button').length > 0;

    if (addSeparateContainer) {
      var downloadButtonContainer = $("<div>", {
        id: 'zcDownloadBtnContainer',
        class: 'sc-button-group'
      });
      downloadButtonContainer.append(downloadButton);
      soundActionsToolbar.append(downloadButtonContainer);
    } else {
      var buttonGroup = soundActionsToolbar.children().first();
      buttonGroup.append(downloadButton);
    }
  }

  chrome.runtime.onMessage.addListener(function (request) {
    switch (request.message) {
      case 'playlistDownloadStarted':
        setDownloadStartedState();
        break;
      case 'playlistDownloadStopped':
        setDownloadStoppedState();
        break;
    }
  });

  function injectDownloadButton() {
    if (document.location.href !== PLAYLIST_TAB_URL) {
      $('#zcDownloadBtn').remove();
      clearTimeout(timeoutId);
      return;
    }

    timeoutId = setTimeout(function () {
      if ($('#zcDownloadBtn').length === 0) {
        addDownloadButton();
        getInitialDownloadState();
      }
      injectDownloadButton();
    }, TIMEOUT_INTERVAL);
  }

  injectDownloadButton();

}
