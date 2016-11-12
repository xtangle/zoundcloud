var SC_API_URL = 'https://api.soundcloud.com/';
var CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';
var ZC_ICON_URL = '../images/icon128.png';
var URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;

var playlist;
var downloadDir;
var isDownloading = false;
var trackIndex = -1;

var tracksDownloaded;
var failedDownloads;
var downloadId;

function sendMessageToContentScript(message) {
  chrome.tabs.query({url: '*://soundcloud.com/*'}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {message: message});
    });
  });
}

function createBasicNotification(notificationId, notificationObj) {
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: ZC_ICON_URL,
    title: notificationObj.title || '',
    message: notificationObj.message || '',
    requireInteraction: notificationObj.requireInteraction || false
  });
}

function createListNotification(notificationId, notificationObj) {
  chrome.notifications.create(notificationId, {
    type: 'list',
    iconUrl: ZC_ICON_URL,
    title: notificationObj.title || '',
    items: notificationObj.items || [],
    message: '',
    requireInteraction: notificationObj.requireInteraction || false
  });
}

function initializeDownload(playlistData) {
  sendMessageToContentScript('downloadStarted');
  playlist = playlistData;
  downloadDir = removeSpecialCharacters(playlist.user.username + ' - ' + playlist.title);
  trackIndex = 0;
  isDownloading = true;
  tracksDownloaded = 0;
  failedDownloads = [];
}

function resetDownload() {
  isDownloading = false;
  trackIndex = -1;
  sendMessageToContentScript('downloadStopped');
}

function getPlaylist(tabUrl) {
  var playlistUrl = SC_API_URL + 'resolve.json?url=' + tabUrl + '&client_id=' + CLIENT_ID;
  return $.getJSON(playlistUrl);
}

function displayDownloadCompleteNotification() {
  createBasicNotification('downloadComplete', {
    title: 'Download Complete',
    message: 'Downloaded ' + tracksDownloaded + ' tracks to \'' + downloadDir + '\'',
    requireInteraction: true
  });
  if (failedDownloads.length > 0) {
    createListNotification('failedDownloads', {
      title: 'Failed Downloads',
      items: failedDownloads.map(function (failedItem) {
        return {
          title: failedItem.trackNumber + ') ' + failedItem.track.title,
          message: '(' + failedItem.reason + ')'
        }
      }),
      requireInteraction: true
    });
  }
}

function initiateDownload(url) {
  if (isDownloading) {
    chrome.downloads.download({
      url: url,
      saveAs: false
    }, function (id) {
      downloadId = id;
    });
  }
}

function onDownloadFailed(reason) {
  failedDownloads.push({
    trackNumber: trackIndex + 1,
    track: playlist.tracks[trackIndex],
    reason: reason
  });
  trackIndex += 1;
  downloadNextTrack();
}

function onDownloadComplete() {
  tracksDownloaded += 1;
  trackIndex += 1;
  downloadNextTrack();
}

function downloadUsingStreamUrl(track) {
  if (track.stream_url) {
    var downloadUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    initiateDownload(downloadUrl);
  } else {
    onDownloadFailed('Not streamable');
  }
}

function downloadNextTrack() {
  if (trackIndex >= playlist.tracks.length) {
    displayDownloadCompleteNotification();
    resetDownload();
    return;
  }

  var track = playlist.tracks[trackIndex];
  var downloadUrl = track.download_url + '?client_id=' + CLIENT_ID;

  if (track.download_url) {
    $.ajax({
      url: downloadUrl,
      type: 'get'
    }).always(function (data, statusText, xhr) {
      if (statusText === 'success' && xhr.status === 200) {
        initiateDownload(downloadUrl);
      } else {
        downloadUsingStreamUrl(track);
      }
    });
  } else {
    downloadUsingStreamUrl(track);
  }
}

function removeSpecialCharacters(filename) {
  // Chrome download api is really finicky with which characters to allow in filenames (eg. the ~ symbol)
  return filename.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url && changeInfo.url.match(URL_PATTERN)) {
    chrome.tabs.executeScript(null, {file: 'lib/jquery-3.1.1.min.js'}, function () {
      chrome.tabs.executeScript(null, {file: 'src/content.js'});
    });
  }
});

chrome.notifications.onClicked.addListener(function (notificationId) {
  switch (notificationId) {
    case 'downloadComplete':
      chrome.downloads.show(downloadId);
    case 'failedDownloads':
    case 'downloadInterrupted':
    case 'downloadStopped':
      chrome.notifications.clear(notificationId);
  }
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
  if (downloadItem.id === downloadId) {
    var fileExtension = downloadItem.filename.split('.').pop();
    var fileName = removeSpecialCharacters(playlist.tracks[trackIndex].title);
    suggest({
      filename: downloadDir + '/' + fileName + '.' + fileExtension
    });
  }
});

chrome.downloads.onChanged.addListener(function (delta) {
  if (!delta.state || delta.id !== downloadId) {
    return;
  }
  if (delta.state.previous === 'in_progress') {
    if (delta.state.current === 'interrupted') {
      createBasicNotification('downloadInterrupted', {
        title: 'Download Interrupted',
        message: 'Downloaded ' + tracksDownloaded + ' tracks to \'' + downloadDir + '\'',
        requireInteraction: true
      });
      chrome.downloads.cancel(downloadId);
      resetDownload();
    } else if (delta.state.current === 'complete') {
      onDownloadComplete();
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
        if (textStatus !== 'success') {
          alert('Could not retrieve playlist information. (' + textStatus + ')');
          sendMessageToContentScript('downloadStopped');
        } else if (!data || data.kind !== 'playlist') {
          alert('Could not retrieve playlist information. (retrieved object is not a playlist)');
          sendMessageToContentScript('downloadStopped');
        } else {
          initializeDownload(data);
          downloadNextTrack();
        }
      });
      break;
    case 'stopDownload':
      chrome.downloads.cancel(downloadId);
      resetDownload();
      createBasicNotification('downloadStopped', {
        title: 'Download Stopped',
        message: 'Downloaded ' + tracksDownloaded + ' tracks to \'' + downloadDir + '\'',
        requireInteraction: true
      });
      break;
    case 'getDownloadState':
      sendResponse({isDownloading: isDownloading});
      break;
  }
});

