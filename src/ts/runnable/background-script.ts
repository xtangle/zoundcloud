import {TrackDownloadService} from '@src/download/track-download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestTrackDownloadMessage} from '@src/messaging/page/request-track-download.message';
import {IRunnable} from '@src/runnable/runnable';
import {ScPageVisitedObservableFactory} from '@src/runnable/sc-page-visited-observable.factory';
import {logger} from '@src/util/logger';
import 'rxjs/add/observable/fromEventPattern';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

export class BackgroundScript implements IRunnable {

  private onSuspend$: Observable<any> = Observable.fromEventPattern<any>(
    (handler: () => void) => chrome.runtime.onSuspend.addListener(handler));
  private subscriptions: Subscription = new Subscription();

  public cleanUp(): void {
    logger.log('Unloading background script');
    this.subscriptions.unsubscribe();
  }

  public run(): void {
    this.subscriptions.add(this.onSuspend$.subscribe(() => this.cleanUp()));
    this.subscriptions.add(
      ScPageVisitedObservableFactory.create().subscribe((details: WebNavigationUrlCallbackDetails) => {
        logger.log('Loading content script', details);
        chrome.tabs.insertCSS(details.tabId, {file: 'styles.css'});
        chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
        chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
      })
    );
    this.subscriptions.add(
      ExtensionMessenger.onMessage(RequestTrackDownloadMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<RequestTrackDownloadMessage>) => {
          TrackDownloadService.downloadTrack(args.message.trackInfo);
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
