import WebNavigationTransitionCallbackDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import {Observable} from 'rxjs/Observable';
import {SC_URL_PATTERN} from './constants';

const soundCloudPageVisited$: Observable<WebNavigationTransitionCallbackDetails> =
  Observable.fromEventPattern<WebNavigationTransitionCallbackDetails>(
    (handler: (details: WebNavigationTransitionCallbackDetails) => void) =>
      chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
  );

soundCloudPageVisited$.subscribe((details: WebNavigationTransitionCallbackDetails) => {
  console.log('On history state updated match!', details);
  chrome.tabs.insertCSS(details.tabId, {file: 'styles.css'});
  chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
  chrome.tabs.executeScript(details.tabId, {file: 'content-script.js'});
});
