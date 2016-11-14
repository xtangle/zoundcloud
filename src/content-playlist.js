var PLAYLIST_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var PLAYLIST_TAB_URL = document.location.href;

if (PLAYLIST_TAB_URL.match(PLAYLIST_URL_PATTERN)) {

  var PLAYLIST_INJECT_INTERVAL = 1000;
  var isDownloadingPlaylist;
  var playlistTimeoutId;
  var showLabelOnPlaylistDownloadButton;

  chrome.runtime.onMessage.addListener(function (request) {
    switch (request.message) {
      case 'playlistDownloadStarted':
        setPlaylistDownloadStartedState();
        break;
      case 'playlistDownloadStopped':
        setPlaylistDownloadStoppedState();
        break;
    }
  });

  function stopPlaylistDownload() {
    chrome.runtime.sendMessage({message: "stopPlaylistDownload"});
  }

  function startPlaylistDownload() {
    chrome.runtime.sendMessage({
      message: 'startPlaylistDownload',
      tabUrl: PLAYLIST_TAB_URL
    });
    setPlaylistDownloadStartedState();
  }

  function setPlaylistDownloadStartedState() {
    isDownloadingPlaylist = true;
    var downloadButton = $('#zcPlaylistDownloadBtn');
    downloadButton
      .removeClass('zc-button-download')
      .addClass('zc-button-stop')
      .addClass('sc-button-active')
      .prop('title', 'Stop downloading playlist');
    if (showLabelOnPlaylistDownloadButton) {
      downloadButton.text('Stop Download');
    }
  }

  function setPlaylistDownloadStoppedState() {
    isDownloadingPlaylist = false;
    var downloadButton = $('#zcPlaylistDownloadBtn');
    downloadButton
      .removeClass('sc-button-active')
      .removeClass('zc-button-stop')
      .addClass('zc-button-download')
      .prop('title', 'Download this playlist');
    if (showLabelOnPlaylistDownloadButton) {
      downloadButton.text('Download');
    }
  }

  function onPlaylistDownloadButtonClick() {
    if (isDownloadingPlaylist) {
      stopPlaylistDownload();
    } else {
      startPlaylistDownload();
    }
  }

  function getPlaylistDownloadState() {
    chrome.runtime.sendMessage({message: "getPlaylistDownloadState"}, function (response) {
      if (response.isDownloadingPlaylist) {
        setPlaylistDownloadStartedState();
      } else {
        setPlaylistDownloadStoppedState();
      }
    });
  }

  function addPlaylistDownloadButton() {
    var soundActionsToolbar = $("div[class~='listenEngagement'] div[class~='soundActions']").first();
    var downloadButton = $('<button>', {
      id: 'zcPlaylistDownloadBtn',
      class: 'sc-button sc-button-medium',
      click: onPlaylistDownloadButtonClick
    });

    showLabelOnPlaylistDownloadButton = soundActionsToolbar.find('.sc-button-responsive').length > 0;
    if (showLabelOnPlaylistDownloadButton) {
      downloadButton.addClass('sc-button-responsive');
    } else {
      downloadButton.addClass('sc-button-icon');
    }

    var soundActionToolbarChildren = soundActionsToolbar.children('div');
    var addSeparateContainer = soundActionToolbarChildren.length > 1 &&
      soundActionToolbarChildren.last().find('button').length > 0;

    if (addSeparateContainer) {
      var downloadButtonContainer = $("<div>", {
        id: 'zcPlaylistDownloadBtnContainer',
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

  function injectPlaylistDownloadButton() {
    if (document.location.href !== PLAYLIST_TAB_URL) {
      $('#zcPlaylistDownloadBtn').remove();
      clearTimeout(playlistTimeoutId);
      return;
    }

    playlistTimeoutId = setTimeout(function () {
      if ($('#zcPlaylistDownloadBtn').length === 0) {
        addPlaylistDownloadButton();
        getPlaylistDownloadState();
      }
      injectPlaylistDownloadButton();
    }, PLAYLIST_INJECT_INTERVAL);
  }

  injectPlaylistDownloadButton();
}
