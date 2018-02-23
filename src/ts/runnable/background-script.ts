import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {SC_URL_PATTERN} from '../constants';
import {logger} from '../util/logger';
import {IRunnable} from './runnable';
import WebNavigationTransitionCallbackDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;

export class BackgroundScript implements IRunnable {

  private soundCloudPageVisited$: Observable<WebNavigationTransitionCallbackDetails> =
    Observable.fromEventPattern<WebNavigationTransitionCallbackDetails>(
      (handler: (details: WebNavigationTransitionCallbackDetails) => void) =>
        chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
    );

  private subscriptions: Subscription = new Subscription();

  public run(): void {
    this.subscriptions.add(this.soundCloudPageVisited$.subscribe((details: WebNavigationTransitionCallbackDetails) => {
      logger.log('On history state updated match!', details);
      chrome.tabs.insertCSS(details.tabId, {file: 'styles.css'});
      chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
      chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
    }));
  }

  public cleanUp(): void {
    this.subscriptions.unsubscribe();
  }
}
