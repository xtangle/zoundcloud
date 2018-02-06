import WebNavigationTransitionCallbackDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import {Observable} from 'rxjs/Observable';
import {SC_URL_PATTERN} from './constants';

const soundCloudPageVisited$: Observable<WebNavigationTransitionCallbackDetails> =
  Observable.fromEventPattern<WebNavigationTransitionCallbackDetails>(
    (handler: (details: WebNavigationTransitionCallbackDetails) => void) =>
      chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
  ).distinctUntilKeyChanged('url');

soundCloudPageVisited$.subscribe((details: WebNavigationTransitionCallbackDetails) => {
  console.log('On history state updated match!', details);
  chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
  chrome.tabs.executeScript(details.tabId, {file: 'contentTrack.js'});
});

/*chrome.webNavigation.onHistoryStateUpdated.addListener((details: WebNavigationCallbackDetails) => {
  console.log('On history state updated match!', details);
  chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
}, {url: [{urlMatches: TRACK_URL_PATTERN.toString().slice(1, -1)}]});*/

/*
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CONTENT_TRACK_OPENED') {
    chrome.tabs.sendMessage(sender.tab.id, {type: 'CLOSE_CONTENT_TRACK'});
  }
});
*/
