var SC_API_URL = 'https://api.soundcloud.com/';
var CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';

var playlist;
var isDownloading = false;
var trackIndex = -1;
var successfulDownloads;
var failedDownloads;
var downloadId;

var urlPattern = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;

function sendMessageToContentScript(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {message: message});
  });
}

function initializeDownload(playlistData) {
  playlist = playlistData;
  trackIndex = 0;
  isDownloading = true;
  successfulDownloads = [];
  failedDownloads = [];
  sendMessageToContentScript('downloadStarted');
}

function resetDownload() {
  isDownloading = false;
  trackIndex = -1;
  downloadId = null;
  sendMessageToContentScript('downloadStopped');
}

function getPlaylist(tabUrl) {
  var playlistUrl = SC_API_URL + 'resolve.json?url=' + tabUrl + '&client_id=' + CLIENT_ID;
  return $.getJSON(playlistUrl);
}

function downloadTracks() {
  if (!playlist || trackIndex >= playlist.tracks.length) {
    resetDownload();
    alert('Download completed.');
    return;
  }
  var track = playlist.tracks[trackIndex];
  var downloadUrl = track.download_url + '?client_id=' + CLIENT_ID;

  $.ajax({
    url: downloadUrl,
    type: 'get'
  }).always(function (data, statusText, xhr) {
    // If download_url doesn't work, use stream_url
    if (xhr.status !== 302) {
      downloadUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    }
    if (track.streamable) {
      chrome.downloads.download({
        url: downloadUrl,
        saveAs: false
      }, function (id) {
        downloadId = id;
      });
    } else {
      console.log('Cannot download track \'' + track.title + '\' - not streamable!');
      trackIndex += 1;
      downloadTracks();
    }
  });
  console.log(playlist.tracks[trackIndex]);
}

function removeSpecialCharacters(filename) {
  // Chrome download api is really finicky with which characters to allow in filenames (eg. the ~ symbol)
  return filename.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.match(urlPattern)) {
    chrome.tabs.executeScript(null, {file: 'lib/jquery-3.1.1.min.js'}, function () {
      chrome.tabs.executeScript(null, {file: 'src/content.js'});
    });
  }
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
  if (downloadItem.id === downloadId) {
    var fileExtension = downloadItem.filename.split('.').pop();
    var downloadDirectory = removeSpecialCharacters(playlist.user.username + ' - ' + playlist.title);
    var fileName = removeSpecialCharacters(playlist.tracks[trackIndex].title);
    suggest({
      filename: downloadDirectory + '/' + fileName + '.' + fileExtension
    });
  }
});

chrome.downloads.onChanged.addListener(function (delta) {
  if (!delta.state || delta.id !== downloadId) {
    return;
  }
  if (delta.state.previous === 'in_progress') {
    if (delta.state.current === 'interrupted') {
      console.log('Download interrupted');
      resetDownload();
    } else if (delta.state.current === 'complete') {
      trackIndex += 1;
      downloadTracks();
    }
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case 'startDownload':
      if (isDownloading) {
        alert('A download is currently in progress. Please wait for it to finish.');
        return;
      }
      getPlaylist(request.tabUrl).always(function (data, textStatus) {
        if (textStatus != 'success') {
          alert('Could not retrieve playlist information. (' + textStatus + ')');
        } else if (!data || data.kind !== 'playlist') {
          alert('Could not retrieve playlist information. (retrieved object is not a playlist)');
        } else {
          initializeDownload(data);
          downloadTracks();
        }
      });
      break;
    case 'stopDownload':
      console.log('Download stopped by user');
      chrome.downloads.cancel(downloadId);
      resetDownload();
      break;
    case 'getDownloadState':
      sendResponse({isDownloading: isDownloading});
      break;
  }
});

