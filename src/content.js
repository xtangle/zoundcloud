if ($('#downloadBtn').length === 0) {

  const SC_API_URL = 'https://api.soundcloud.com/';
  const CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';

  var playlist = getPlaylist();
  var isDownloading = false;

  function getPlaylist() {
    var tabUrl = document.location.href;
    var playlistUrl = SC_API_URL + 'resolve.json?url=' + tabUrl + '&client_id=' + CLIENT_ID;
    $.getJSON(playlistUrl, function (data) {
      playlist = data;
    });
  }

  function downloadPlaylist() {
    if (!playlist) {
      alert('Playlist information has not been loaded yet!');
      return;
    }
    chrome.runtime.sendMessage({
      message: "startDownload",
      playlist: playlist,
      clientId: CLIENT_ID
    });
  }

  function onDownloadButtonClick() {
    if (isDownloading) {
      chrome.runtime.sendMessage({message: "stopDownload"});
    } else {
      downloadPlaylist();
    }
  }

  function setDownloadStartedState() {
    isDownloading = true;
    $('#downloadBtn').text('Stop Download');
  }

  function setDownloadStoppedState() {
    isDownloading = false;
    $('#downloadBtn').text('Download Playlist');
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
      id: 'downloadBtn',
      class: 'sc-button-medium sc-button',
      click: onDownloadButtonClick
    });

    if (soundActionsToolbar.children('div').length === 1) {
      var buttonGroup = soundActionsToolbar.children().first();
      buttonGroup.append(downloadButton);
    } else {
      var downloadButtonContainer = $("<div>", {
        id: 'downloadBtnContainer',
        class: 'sc-button-group'
      });
      downloadButtonContainer.append(downloadButton);
      soundActionsToolbar.append(downloadButtonContainer);
    }
  }

  addDownloadButton();
  getInitialDownloadState();
}

chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === 'downloadStarted') {
    setDownloadStartedState();
  } else if (request.message === 'downloadStopped') {
    setDownloadStoppedState();
  }
});