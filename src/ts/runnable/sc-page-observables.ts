import {SC_URL_PATTERN} from '@src/constants';
import {fromEventPattern, merge, Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

export const ScPageObservables = {
  scPageVisited$(): Observable<WebNavigationUrlCallbackDetails> {
    const scWebNavOnCompleted$: Observable<WebNavigationUrlCallbackDetails> =
      fromEventPattern<WebNavigationUrlCallbackDetails>(
        (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
          chrome.webNavigation.onCompleted.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
      );

    /**
     * onHistoryStateUpdated emits two events on every navigation: one event with URL of the old page and
     * one with URL of the new page.
     */
    const scWebNavOnHistoryUpdated$: Observable<WebNavigationUrlCallbackDetails> =
      fromEventPattern<WebNavigationUrlCallbackDetails>(
        (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
          chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
      );

    // The de-bounce ensures we do not unnecessarily load multiple content scripts
    return merge(scWebNavOnCompleted$, scWebNavOnHistoryUpdated$).pipe(debounceTime(20));
  }
};
