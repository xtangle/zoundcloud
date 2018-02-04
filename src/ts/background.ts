import WebNavigationCallbackDetails = chrome.webNavigation.WebNavigationCallbackDetails;
import {PLAYLIST_URL_PATTERN, SC_URL_PATTERN, TRACK_URL_PATTERN} from './constants';

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && changeInfo.url.match(SC_URL_PATTERN)) {
    if (changeInfo.url.match(PLAYLIST_URL_PATTERN)) {
      console.log('Playlist URL Matches!');
      chrome.tabs.executeScript(null, {file: 'vendor.js'});
      chrome.tabs.executeScript(null, {file: 'content.js'});
    } else if (changeInfo.url.match(TRACK_URL_PATTERN)) {
      console.log('Track URL Matches!');
      chrome.tabs.executeScript(null, {file: 'vendor.js'});
      chrome.tabs.executeScript(null, {file: 'content.js'});
    }
  }
});

/*chrome.webNavigation.onHistoryStateUpdated.addListener((details: WebNavigationCallbackDetails) => {
  console.log('On onHistoryStateUpdated match!', details);
  chrome.tabs.executeScript(null, {file: 'content.js'});
}, {url: [{urlMatches: TRACK_URL_PATTERN.toString().slice(1, -1)}]});*/

/*chrome.webNavigation.onHistoryStateUpdated.addListener((details: WebNavigationCallbackDetails) => {
  console.log('On history state updated match!', details);
  chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
}, {url: [{urlMatches: TRACK_URL_PATTERN.toString().slice(1, -1)}]});*/
