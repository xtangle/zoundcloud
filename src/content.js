if ($('#zcDownloadBtn').length === 0) {

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

  function stopDownload() {
    chrome.runtime.sendMessage({message: "stopDownload"});
    setDownloadStoppedState();
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
    setDownloadStartedState();
  }

  function setDownloadStartedState() {
    isDownloading = true;
    $('#zcDownloadBtn').text('Stop Download');
  }

  function setDownloadStoppedState() {
    isDownloading = false;
    $('#zcDownloadBtn').text('Download Playlist');
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
      class: 'sc-button-medium sc-button',
      click: onDownloadButtonClick
    });

    if (soundActionsToolbar.children('div').length === 1) {
      var buttonGroup = soundActionsToolbar.children().first();
      buttonGroup.append(downloadButton);
    } else {
      var downloadButtonContainer = $("<div>", {
        id: 'zcDownloadBtnContainer',
        class: 'sc-button-group'
      });
      downloadButtonContainer.append(downloadButton);
      soundActionsToolbar.append(downloadButtonContainer);
    }
  }

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.message === 'downloadStarted') {
      setDownloadStartedState();
    } else if (request.message === 'downloadStopped') {
      setDownloadStoppedState();
    }
  });

  addDownloadButton();
  getInitialDownloadState();
}
