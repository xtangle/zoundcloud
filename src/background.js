var SC_API_URL = 'https://api.soundcloud.com/';
var SC_I1_API_URL = 'https://api.soundcloud.com/i1/';
var CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';
var I1_CLIENT_ID = '02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea';
var ZC_ICON_URL = '../assets/images/icon128.png';

var SC_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\//;
var PLAYLIST_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
var TRACK_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/(?:[^\/]+$)|(?:[^\/]+(?=(?:\?in=)).+$)/;

var playlist;
var playlistDownloadDirectory;
var isDownloadingPlaylist = false;
var playlistTrackIndex = -1;
var numberOfPlaylistTracksDownloaded;

var failedPlaylistDownloads;
var playlistTrackDownloadId;
var lastSuccessfulPlaylistTrackDownloadId;
var playlistDownloadCancelled;

var track;
var trackDownloadId;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global Function Definitions & Listeners
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url && changeInfo.url.match(SC_URL_PATTERN)) {
    if (changeInfo.url.match(PLAYLIST_URL_PATTERN)) {
      loadContentPlaylistScript();
    } else if (changeInfo.url.match(TRACK_URL_PATTERN)) {
      loadContentTrackScript();
    }
  }
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
  var fileExtension, fileName;
  if (downloadItem.id === playlistTrackDownloadId) {
    fileExtension = downloadItem.filename.split('.').pop();
    fileName = removeSpecialCharacters(playlist.tracks[playlistTrackIndex].title);
    suggest({
      filename: playlistDownloadDirectory + '/' + fileName + '.' + fileExtension
    });
  } else if (downloadItem.id === trackDownloadId) {
    fileExtension = downloadItem.filename.split('.').pop();
    fileName = removeSpecialCharacters(track.title);
    suggest({
      filename: fileName + '.' + fileExtension
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case 'startPlaylistDownload':
      startPlaylistDownload(request.tabUrl);
      break;
    case 'stopPlaylistDownload':
      stopPlaylistDownload();
      break;
    case 'getPlaylistDownloadState':
      sendResponse({isDownloadingPlaylist: isDownloadingPlaylist});
      break;
    case 'startTrackDownload':
      startTrackDownload(request.tabUrl);
      break;
  }
});

chrome.notifications.onClicked.addListener(function (notificationId) {
  switch (notificationId) {
    case 'playlistDownloadComplete':
    case 'playlistDownloadStopped':
      if (lastSuccessfulPlaylistTrackDownloadId) {
        chrome.downloads.show(lastSuccessfulPlaylistTrackDownloadId);
      }
      chrome.notifications.clear(notificationId);
      break;
    case 'failedPlaylistDownloads':
    case 'unableToStartPlaylistDownload':
    case 'unableToStartTrackDownload':
      chrome.notifications.clear(notificationId);
      break;
  }
});

chrome.downloads.onChanged.addListener(function (delta) {
  if (!delta.state) {
    return;
  }
  if (delta.id === playlistTrackDownloadId && delta.state.previous === 'in_progress') {
    if (delta.state.current === 'interrupted' && !playlistDownloadCancelled) {
      chrome.downloads.search({id: playlistTrackDownloadId}, function (downloadItems) {
        displayPlaylistDownloadStoppedNotification(downloadItems[0].error);
        resetPlaylistDownload();
      });
    } else if (delta.state.current === 'complete') {
      onPlaylistTrackDownloadComplete();
    }
  }
});

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
    contextMessage: notificationObj.contextMessage || null,
    requireInteraction: notificationObj.requireInteraction || false,
    priority: 1
  });
}

function createListNotification(notificationId, notificationObj) {
  chrome.notifications.create(notificationId, {
    type: 'list',
    iconUrl: ZC_ICON_URL,
    title: notificationObj.title || '',
    items: notificationObj.items || [],
    message: '',
    requireInteraction: notificationObj.requireInteraction || false,
    priority: 1
  });
}

function initiateTrackDownload(url, successCallback, failCallback) {
  chrome.downloads.download({
    url: url,
    saveAs: false
  }, function (id) {
    if (id) {
      successCallback(id);
    } else {
      failCallback(chrome.runtime.lastError.message);
    }
  });
}

function downloadTrackUsingI1StreamUrl(track, successCallback, failCallback) {
  var i1StreamsUrl = SC_I1_API_URL + 'tracks/' + track.id + '/streams?client_id=' + I1_CLIENT_ID;
  $.getJSON(i1StreamsUrl).always(function (data, statusText) {
    var downloadUrl;
    if (statusText === 'success') {
      downloadUrl = data['http_mp3_128_url'];
    }
    if (downloadUrl) {
      initiateTrackDownload(downloadUrl, successCallback, failCallback);
    } else {
      failCallback('Cannot get stream url');
    }
  });
}

function downloadTrackUsingStreamUrl(track, successCallback, failCallback) {
  if (track.stream_url) {
    var downloadUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    initiateTrackDownload(downloadUrl, successCallback, failCallback);
  } else {
    downloadTrackUsingI1StreamUrl(track, successCallback, failCallback);
  }
}

function downloadTrackUsingDownloadUrl(track, successCallback, failCallback) {
  if (track.download_url) {
    var downloadUrl = track.download_url + '?client_id=' + CLIENT_ID;
    $.ajax({
      url: downloadUrl,
      type: 'get'
    }).always(function (data, statusText, xhr) {
      if (statusText === 'success' && xhr.status === 200) {
        initiateTrackDownload(downloadUrl, successCallback, failCallback);
      } else {
        downloadTrackUsingStreamUrl(track, successCallback, failCallback);
      }
    });
  } else {
    downloadTrackUsingStreamUrl(track, successCallback, failCallback);
  }
}

function removeSpecialCharacters(path) {
  // Chrome download api is really finicky with which characters to allow in filenames (eg. the ~ symbol)
  return path.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
}

function loadContentPlaylistScript() {
  chrome.tabs.executeScript(null, {file: 'lib/jquery-3.1.1.min.js'}, function () {
    chrome.tabs.executeScript(null, {file: 'src/content-playlist.js'});
  });
}

function loadContentTrackScript() {
  chrome.tabs.executeScript(null, {file: 'lib/jquery-3.1.1.min.js'}, function () {
    chrome.tabs.executeScript(null, {file: 'src/content-track.js'});
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Playlist Download Function Definitions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createPlaylistDownloadSummaryMessage() {
  switch (numberOfPlaylistTracksDownloaded) {
    case 0:
      return 'No tracks were downloaded';
    case 1:
      return 'Downloaded 1 track to \'' + playlistDownloadDirectory + '\'';
    default:
      return 'Downloaded ' + numberOfPlaylistTracksDownloaded + ' tracks to \'' + playlistDownloadDirectory + '\'';
  }
}

function displayUnableToStartPlaylistDownloadNotification(message) {
  createBasicNotification('unableToStartPlaylistDownload', {
    title: 'Unable To Start Playlist Download',
    message: message,
    requireInteraction: false
  });
}

function displayPlaylistDownloadStoppedNotification(interruptReason) {
  createBasicNotification('playlistDownloadStopped', {
    title: 'Playlist Download Stopped',
    message: createPlaylistDownloadSummaryMessage(),
    contextMessage: 'Interrupt Reason: ' + interruptReason,
    requireInteraction: true
  });
}

function displayPlaylistDownloadCompleteNotification() {
  createBasicNotification('playlistDownloadComplete', {
    title: 'Playlist Download Complete',
    message: createPlaylistDownloadSummaryMessage(),
    requireInteraction: true
  });
  if (failedPlaylistDownloads.length > 0) {
    createListNotification('failedPlaylistDownloads', {
      title: 'Failed Playlist Downloads',
      items: failedPlaylistDownloads.map(function (failedItem) {
        return {
          title: failedItem.trackNumber + ') ' + failedItem.track.title,
          message: '(' + failedItem.reason + ')'
        }
      }),
      requireInteraction: true
    });
  }
}

function clearPlaylistNotifications() {
  chrome.notifications.clear('playlistDownloadComplete');
  chrome.notifications.clear('playlistDownloadStopped');
  chrome.notifications.clear('failedPlaylistDownloads');
  chrome.notifications.clear('unableToStartPlaylistDownload');
}

function initializePlaylistDownload(playlistData) {
  sendMessageToContentScript('playlistDownloadStarted');
  playlist = playlistData;
  playlistDownloadDirectory = removeSpecialCharacters(playlist.user.username + ' - ' + playlist.title);
  playlistTrackIndex = 0;
  isDownloadingPlaylist = true;
  numberOfPlaylistTracksDownloaded = 0;
  failedPlaylistDownloads = [];
  playlistTrackDownloadId = null;
  lastSuccessfulPlaylistTrackDownloadId = null;
  playlistDownloadCancelled = false;
  clearPlaylistNotifications();
}

function resetPlaylistDownload() {
  isDownloadingPlaylist = false;
  playlistTrackIndex = -1;
  playlistDownloadCancelled = true;
  sendMessageToContentScript('playlistDownloadStopped');
}

function getPlaylist(tabUrl) {
  var playlistUrl = SC_API_URL + 'resolve.json?url=' + tabUrl + '&client_id=' + CLIENT_ID;
  return $.getJSON(playlistUrl);
}

function onPlaylistTrackDownloadStart(id) {
  playlistTrackDownloadId = id;
  if (!isDownloadingPlaylist) {
    chrome.downloads.cancel(playlistTrackDownloadId);
  }
}

function onPlaylistTrackDownloadFail(reason) {
  failedPlaylistDownloads.push({
    trackNumber: playlistTrackIndex + 1,
    track: playlist.tracks[playlistTrackIndex],
    reason: reason
  });
  playlistTrackIndex += 1;
  downloadNextPlaylistTrack();
}

function onPlaylistTrackDownloadComplete() {
  numberOfPlaylistTracksDownloaded += 1;
  playlistTrackIndex += 1;
  lastSuccessfulPlaylistTrackDownloadId = playlistTrackDownloadId;
  downloadNextPlaylistTrack();
}

function downloadNextPlaylistTrack() {
  if (playlistTrackIndex >= playlist.tracks.length) {
    displayPlaylistDownloadCompleteNotification();
    resetPlaylistDownload();
    return;
  }
  downloadTrackUsingDownloadUrl(
    playlist.tracks[playlistTrackIndex],
    onPlaylistTrackDownloadStart,
    onPlaylistTrackDownloadFail
  );
}

function startPlaylistDownload(tabUrl) {
  if (isDownloadingPlaylist) {
    displayUnableToStartPlaylistDownloadNotification(
      'A playlist download is currently in progress, please wait for it to finish');
    return;
  }
  getPlaylist(tabUrl).always(function (data, textStatus) {
    if (textStatus !== 'success' || !data || data.kind !== 'playlist') {
      displayUnableToStartPlaylistDownloadNotification('Could not retrieve playlist information');
      sendMessageToContentScript('playlistDownloadStopped');
    } else {
      initializePlaylistDownload(data);
      downloadNextPlaylistTrack();
    }
  });
}

function stopPlaylistDownload() {
  chrome.downloads.search({id: playlistTrackDownloadId}, function (downloadItems) {
    if (downloadItems[0].state === 'complete') {
      resetPlaylistDownload();
      displayPlaylistDownloadStoppedNotification('USER_CANCELED');
    } else {
      chrome.downloads.cancel(playlistTrackDownloadId);
    }
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Track Download Function Definitions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function displayUnableToStartTrackDownloadNotification(message) {
  createBasicNotification('unableToStartTrackDownload', {
    title: 'Unable To Download Track',
    message: message,
    requireInteraction: false
  });
}

function startTrackDownload(tabUrl) {
  var trackUrl = SC_API_URL + 'resolve.json?url=' + tabUrl + '&client_id=' + CLIENT_ID;
  $.getJSON(trackUrl).always(function (data, textStatus) {
    if (textStatus !== 'success' || !data || data.kind !== 'track') {
      displayUnableToStartTrackDownloadNotification('Could not retrieve track information');
    } else {
      track = data;
      downloadTrackUsingDownloadUrl(track,
        function (id) {
          trackDownloadId = id;
        },
        displayUnableToStartTrackDownloadNotification);
    }
  });
}