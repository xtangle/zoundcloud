import {bindCallback, fromEventPattern, merge, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {SC_URL_HOST} from 'src/ts/constants';
import {concatFilter} from 'src/ts/util/rxjs-operators';
import Tab = chrome.tabs.Tab;
import WebNavigationFramedCallbackDetails = chrome.webNavigation.WebNavigationFramedCallbackDetails;
import WebNavigationTransitionCallbackDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;

const initialNavigationToScPage$: Observable<number> =
  fromEventPattern<number>((handler: (tabId: number) => void) =>
    chrome.webNavigation.onDOMContentLoaded.addListener(
      (details: WebNavigationFramedCallbackDetails) => handler(details.tabId),
      {url: [{hostEquals: SC_URL_HOST}]},
    ),
  );

/**
 * onHistoryStateUpdated emits two events on every navigation: one event with URL of the old page and
 * one with URL of the new page. This is the reason why there is a debounceTime.
 */
const navigateBetweenScPages$: Observable<number> =
  fromEventPattern<number>((handler: (tabId: number) => void) =>
    chrome.webNavigation.onHistoryStateUpdated.addListener(
      (details: WebNavigationTransitionCallbackDetails) => handler(details.tabId),
      {url: [{hostEquals: SC_URL_HOST}]},
    ),
  ).pipe(debounceTime(20));

const tabExists$: (tabId: number) => Observable<boolean> =
  (tabId: number) => bindCallback(chrome.tabs.get)(tabId).pipe(
    map((tab: Tab) => !chrome.runtime.lastError && tab !== undefined),
  );

export const ScPageObservables = {
  goToSoundCloudPage$(): Observable<number> {
    return merge(initialNavigationToScPage$, navigateBetweenScPages$)
      .pipe(concatFilter(tabExists$));
  },
};
