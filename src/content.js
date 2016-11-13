var URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var TAB_URL = document.location.href;

if (TAB_URL.match(URL_PATTERN)) {

  var TIMEOUT_INTERVAL = 1000;
  var isDownloading;
  var timeoutId;
  var showLabelOnButton;

  function stopDownload() {
    chrome.runtime.sendMessage({message: "stopDownload"});
  }

  function downloadPlaylist() {
    chrome.runtime.sendMessage({
      message: "startDownload",
      tabUrl: TAB_URL
    });
    setDownloadStartedState();
  }

  function setDownloadStartedState() {
    isDownloading = true;
    var downloadButton = $('#zcDownloadBtn');
    downloadButton
      .removeClass('zc-button-download')
      .addClass('zc-button-stop')
      .prop('title', 'Stop downloading playlist');
    if (showLabelOnButton) {
      downloadButton.text('Stop Download');
    }
  }

  function setDownloadStoppedState() {
    isDownloading = false;
    var downloadButton = $('#zcDownloadBtn');
    downloadButton
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
    chrome.runtime.sendMessage({message: "getDownloadState"}, function (response) {
      if (response.isDownloading) {
        setDownloadStartedState();
      } else {
        setDownloadStoppedState();
      }
    });
  }

  function addDownloadButton() {

    var soundActionsToolbar = $("div[class~='listenEngagement'] div[class~='soundActions']").first();
    var downloadButton = $('<button>', {
      id: 'zcDownloadBtn',
      class: 'sc-button sc-button-medium',
      click: onDownloadButtonClick
    });

    if (soundActionsToolbar.children('div').length === 1) {
      var buttonGroup = soundActionsToolbar.children().first();
      showLabelOnButton = true;
      downloadButton.addClass('sc-button-responsive');
      buttonGroup.append(downloadButton);
    } else {
      var downloadButtonContainer = $("<div>", {
        id: 'zcDownloadBtnContainer',
        class: 'sc-button-group'
      });
      showLabelOnButton = false;
      downloadButton.addClass('sc-button-icon');
      downloadButtonContainer.append(downloadButton);
      soundActionsToolbar.append(downloadButtonContainer);
    }
  }

  chrome.runtime.onMessage.addListener(function (request) {
    switch (request.message) {
      case 'downloadStarted':
        setDownloadStartedState();
        break;
      case 'downloadStopped':
        setDownloadStoppedState();
        break;
    }
  });

  function injectDownloadButton() {
    if (document.location.href !== TAB_URL) {
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
