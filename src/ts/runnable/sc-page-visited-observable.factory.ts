import {SC_URL_PATTERN} from '@src/constants';
import {Observable} from 'rxjs/Observable';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

export const ScPageVisitedObservableFactory = {
  create(): Observable<WebNavigationUrlCallbackDetails> {
    const scWebNavOnCompleted$: Observable<WebNavigationUrlCallbackDetails> =
      Observable.fromEventPattern<WebNavigationUrlCallbackDetails>(
        (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
          chrome.webNavigation.onCompleted.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
      );

    /**
     * onHistoryStateUpdated emits two events on every navigation: one event with URL of the old page and
     * one with URL of the new page. The de-bounce ensures we only receive tha later event.
     */
    const scWebNavOnHistoryUpdated$: Observable<WebNavigationUrlCallbackDetails> =
      Observable.fromEventPattern<WebNavigationUrlCallbackDetails>(
        (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
          chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
      ).debounceTime(20);

    return Observable.merge(scWebNavOnCompleted$, scWebNavOnHistoryUpdated$);
  }
};
