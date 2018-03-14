import {SC_URL_PATTERN} from '@src/constants';
import {DownloadService} from '@src/download/download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {IRunnable} from '@src/runnable/runnable';
import {logger} from '@src/util/logger';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

export class BackgroundScript implements IRunnable {

  public scPageVisited$: Observable<WebNavigationUrlCallbackDetails>;

  private onSuspend$: Observable<any> = Observable.fromEventPattern<any>(
    (handler: () => void) => chrome.runtime.onSuspend.addListener(handler));

  private scWebNavOnCompleted$: Observable<WebNavigationUrlCallbackDetails> =
    Observable.fromEventPattern<WebNavigationUrlCallbackDetails>(
      (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
        chrome.webNavigation.onCompleted.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
    );

  /**
   * onHistoryStateUpdated emits two events on every navigation: one event with URL of the old page and
   * one with URL of the new page. The de-bounce ensures we only receive tha later event.
   */
  private scWebNavOnHistoryUpdated$: Observable<WebNavigationUrlCallbackDetails> =
    Observable.fromEventPattern<WebNavigationUrlCallbackDetails>(
      (handler: (details: WebNavigationUrlCallbackDetails) => void) =>
        chrome.webNavigation.onHistoryStateUpdated.addListener(handler, {url: [{urlMatches: SC_URL_PATTERN}]})
    ).debounceTime(20);

  private subscriptions: Subscription = new Subscription();

  public constructor() {
    this.scPageVisited$ = Observable.merge(this.scWebNavOnCompleted$, this.scWebNavOnHistoryUpdated$);
  }

  public cleanUp(): void {
    logger.log('Unloading background script');
    this.subscriptions.unsubscribe();
  }

  public run(): void {
    this.subscriptions.add(this.onSuspend$.subscribe(() => this.cleanUp()));
    this.subscriptions.add(this.scPageVisited$.subscribe((details: WebNavigationUrlCallbackDetails) => {
      logger.log('Bootstrapped content script', details);
      chrome.tabs.insertCSS(details.tabId, {file: 'styles.css'});
      chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
      chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
    }));
    this.subscriptions.add(
      ExtensionMessenger.onMessage(RequestTrackDownloadMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<RequestTrackDownloadMessage>) => {
          DownloadService.downloadTrack(args.message.trackInfo);
        })
    );
    this.subscriptions.add(
      ExtensionMessenger.onMessage(RequestContentPageReloadMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<RequestContentPageReloadMessage>) => {
          ExtensionMessenger.sendToContentPage(args.sender.tab.id,
            new ReloadContentPageMessage(args.message.contentPageId));
        })
    );
  }
}
