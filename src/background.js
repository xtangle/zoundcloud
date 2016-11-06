var playlist;
var clientId;

var isDownloading = false;
var trackIndex = -1;
var downloadId;

function sendMessageToContentScript(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: message});
  });
}

function resetDownload() {
  isDownloading = false;
  trackIndex = -1;
  downloadId = null;
  sendMessageToContentScript('downloadStopped');
}

function downloadTracks() {
  if (!playlist || trackIndex >= playlist.tracks.length) {
    resetDownload();
    alert('Download completed.');
    return;
  }
  var track = playlist.tracks[trackIndex];
  var downloadUrl = track.download_url || track.stream_url;
  chrome.downloads.download({
    url: downloadUrl + '?client_id=' + clientId,
    saveAs: false
  }, function(id) {
    downloadId = id;
  });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  if(details.frameId === 0) {
    chrome.tabs.get(details.tabId, function(tab) {
      if(tab.url === details.url) {
        chrome.tabs.executeScript(null, {file:"src/content.js"});
      }
    });
  }
});

chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
  var downloadDirectory = playlist.user.username + ' - ' + playlist.title;
  var trackName = playlist.tracks[trackIndex].title;
  var fileExtension = downloadItem.filename.split('.').pop();
  // Chrome download api is really finicky with which characters to allow in filenames (eg. the ~ symbol)
  var fileName = trackName.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
  suggest({
    filename: downloadDirectory + '/' + fileName + '.' + fileExtension
  });
});

chrome.downloads.onChanged.addListener(function(delta) {
  if (!delta.state || delta.id !== downloadId) {
    return;
  }
  if (delta.state.previous === 'in_progress') {
    if (delta.state.current === 'interrupted') {
      resetDownload();
    } else if (delta.state.current === 'complete') {
      trackIndex += 1;
      downloadTracks();
    }
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'startDownload') {
    clientId = request.clientId;
    playlist = request.playlist;
    if (isDownloading) {
      alert('A download is currently in progress. Please wait for it to finish.');
      return;
    }
    trackIndex = 0;
    isDownloading = true;
    sendMessageToContentScript('downloadStarted');
    downloadTracks();
  } else if (request.message === 'stopDownload') {
    chrome.downloads.cancel(downloadId);
  } else if (request.message === 'getDownloadState') {
    sendResponse({isDownloading: isDownloading});
  }
});

