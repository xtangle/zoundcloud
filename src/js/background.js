import $ from 'jquery';

const SC_API_URL = 'https://api.soundcloud.com/';
const SC_I1_API_URL = 'https://api.soundcloud.com/i1/';
const CLIENT_ID = 'a3e059563d7fd3372b49b37f00a00bcf';
const I1_CLIENT_ID = 'fDoItMDbsbZz8dY16ZzARCZmzgHBPotA';
const ZC_ICON_URL = '../images/icon128.png';

const SC_URL_PATTERN = /^[^\/]+:\/\/soundcloud\.com\//;
const PLAYLIST_URL_PATTERN =
  /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/sets\/[^\/]+$/;
const TRACK_URL_PATTERN =
  /^[^\/]+:\/\/soundcloud\.com\/[^\/]+\/(?:[^\/]+$)|(?:[^\/]+(?=(?:\?in=)).+$)/;

let playlist;
let playlistDownloadDirectory;
let isDownloadingPlaylist = false;
let playlistTrackIndex = -1;
let numberOfPlaylistTracksDownloaded;

let failedPlaylistDownloads;
let playlistTrackDownloadId;
let lastSuccessfulPlaylistTrackDownloadId;
let playlistDownloadCancelled;

let track;
let trackDownloadId;

// =============================================================================
// Global Function Definitions & Listeners
// =============================================================================

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && changeInfo.url.match(SC_URL_PATTERN)) {
    if (changeInfo.url.match(PLAYLIST_URL_PATTERN)) {
      executeScript('js/content-playlist.js');
      executeScript('js/content-tracklist.js');
    } else if (changeInfo.url.match(TRACK_URL_PATTERN)) {
      executeScript('js/content-track.js');
    }
  }
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  if (downloadItem.id === playlistTrackDownloadId) {
    let fileExtension = downloadItem.filename.split('.').pop();
    let fileName = removeSpecialCharacters(
      playlist.tracks[playlistTrackIndex].title);
    suggest({
      filename: playlistDownloadDirectory + '/' +
      fileName + '.' + fileExtension,
    });
  } else if (downloadItem.id === trackDownloadId) {
    let fileExtension = downloadItem.filename.split('.').pop();
    let fileName = removeSpecialCharacters(track.title);
    suggest({
      filename: fileName + '.' + fileExtension,
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

chrome.notifications.onClicked.addListener((notificationId) => {
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

chrome.downloads.onChanged.addListener((delta) => {
  if (!delta.state) {
    return;
  }
  if (delta.id === playlistTrackDownloadId
    && delta.state.previous === 'in_progress') {
    if (delta.state.current === 'interrupted' && !playlistDownloadCancelled) {
      chrome.downloads.search({id: playlistTrackDownloadId},
        (downloadItems) => {
          displayPlaylistDownloadStoppedNotification(downloadItems[0].error);
          resetPlaylistDownload();
        }
      );
    } else if (delta.state.current === 'complete') {
      onPlaylistTrackDownloadComplete();
    }
  }
});

function sendMessageToContentScript(message) {
  chrome.tabs.query({url: '*://soundcloud.com/*'}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: message});
    });
  });
}

function createBasicNotification(notificationId, notificationObj) {
  chrome.notifications.create(notificationId, {
    contextMessage: notificationObj.contextMessage || null,
    iconUrl: ZC_ICON_URL,
    message: notificationObj.message || '',
    priority: 1,
    requireInteraction: notificationObj.requireInteraction || false,
    title: notificationObj.title || '',
    type: 'basic',
  });
}

function createListNotification(notificationId, notificationObj) {
  chrome.notifications.create(notificationId, {
    iconUrl: ZC_ICON_URL,
    items: notificationObj.items || [],
    message: '',
    priority: 1,
    requireInteraction: notificationObj.requireInteraction || false,
    title: notificationObj.title || '',
    type: 'list',
  });
}

function initiateTrackDownload(url, successCallback, failCallback) {
  chrome.downloads.download({
    saveAs: false,
    url: url,
  }, (id) => {
    id ? successCallback(id) : failCallback(chrome.runtime.lastError.message);
  });
}

function downloadTrackUsingI1StreamUrl(track, successCallback, failCallback) {
  let i1StreamsUrl = SC_I1_API_URL + 'tracks/' + track.id
    + '/streams?client_id=' + I1_CLIENT_ID;
  $.getJSON(i1StreamsUrl).always((data, statusText) => {
    let downloadUrl;
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
    let downloadUrl = track.stream_url + '?client_id=' + CLIENT_ID;
    initiateTrackDownload(downloadUrl, successCallback, failCallback);
  } else {
    downloadTrackUsingI1StreamUrl(track, successCallback, failCallback);
  }
}

function downloadTrackUsingDownloadUrl(track, successCallback, failCallback) {
  if (track.download_url) {
    let downloadUrl = track.download_url + '?client_id=' + CLIENT_ID;
    $.ajax({
      type: 'head',
      url: downloadUrl,
    }).always((data, statusText, xhr) => {
      if (xhr && xhr['status'] === 200) {
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
  // Chrome download api is really finicky with which characters to
  // allow in filenames (eg. the ~ symbol)
  return path.replace(/[<>:"|?*\/\\]/g, '_').replace(/~/g, '-');
}

function executeScript(fileUrl) {
  chrome.tabs.executeScript(null, {file: fileUrl});
}

// =============================================================================
// Playlist Download Function Definitions
// =============================================================================

function createPlaylistDownloadSummaryMessage() {
  switch (numberOfPlaylistTracksDownloaded) {
    case 0:
      return 'No tracks were downloaded';
    case 1:
      return 'Downloaded 1 track to \'' + playlistDownloadDirectory + '\'';
    default:
      return 'Downloaded ' + numberOfPlaylistTracksDownloaded
        + ' tracks to \'' + playlistDownloadDirectory + '\'';
  }
}

function displayUnableToStartPlaylistDownloadNotification(message) {
  createBasicNotification('unableToStartPlaylistDownload', {
    message: message,
    requireInteraction: false,
    title: 'Unable To Start Playlist Download',
  });
}

function displayPlaylistDownloadStoppedNotification(interruptReason) {
  createBasicNotification('playlistDownloadStopped', {
    contextMessage: 'Interrupt Reason: ' + interruptReason,
    message: createPlaylistDownloadSummaryMessage(),
    requireInteraction: true,
    title: 'Playlist Download Stopped',
  });
}

function displayPlaylistDownloadCompleteNotification() {
  createBasicNotification('playlistDownloadComplete', {
    message: createPlaylistDownloadSummaryMessage(),
    requireInteraction: true,
    title: 'Playlist Download Complete',
  });
  if (failedPlaylistDownloads.length > 0) {
    createListNotification('failedPlaylistDownloads', {
      items: failedPlaylistDownloads.map((failedItem) => {
        return {
          message: '(' + failedItem.reason + ')',
          title: failedItem.trackNumber + ') ' + failedItem.track.title,
        };
      }),
      requireInteraction: true,
      title: 'Failed Playlist Downloads',
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
  playlistDownloadDirectory =
    removeSpecialCharacters(playlist.user.username + ' - ' + playlist.title);
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
  let playlistUrl = SC_API_URL + 'resolve.json?url=' + tabUrl
    + '&client_id=' + CLIENT_ID;
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
    reason: reason,
    track: playlist.tracks[playlistTrackIndex],
    trackNumber: playlistTrackIndex + 1,
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
      'A playlist download is currently in progress, '
      + 'please wait for it to finish');
    return;
  }
  getPlaylist(tabUrl).always((data, textStatus) => {
    if (textStatus !== 'success' || !data || data.kind !== 'playlist') {
      displayUnableToStartPlaylistDownloadNotification(
        'Could not retrieve playlist information');
      sendMessageToContentScript('playlistDownloadStopped');
    } else {
      initializePlaylistDownload(data);
      downloadNextPlaylistTrack();
    }
  });
}

function stopPlaylistDownload() {
  chrome.downloads.search({id: playlistTrackDownloadId}, (downloadItems) => {
    if (downloadItems[0].state === 'complete') {
      resetPlaylistDownload();
      displayPlaylistDownloadStoppedNotification('USER_CANCELED');
    } else {
      chrome.downloads.cancel(playlistTrackDownloadId);
    }
  });
}

// =============================================================================
// Track Download Function Definitions
// =============================================================================

function displayUnableToStartTrackDownloadNotification(message) {
  createBasicNotification('unableToStartTrackDownload', {
    message: message,
    requireInteraction: false,
    title: 'Unable To Download Track',
  });
}

function startTrackDownload(tabUrl) {
  let trackUrl = SC_API_URL + 'resolve.json?url=' + tabUrl
    + '&client_id=' + CLIENT_ID;
  $.getJSON(trackUrl).always((data, textStatus) => {
    if (textStatus !== 'success' || !data || data.kind !== 'track') {
      displayUnableToStartTrackDownloadNotification(
        'Could not retrieve track information');
    } else {
      track = data;
      downloadTrackUsingDownloadUrl(track, (id) => trackDownloadId = id,
        displayUnableToStartTrackDownloadNotification);
    }
  });
}
