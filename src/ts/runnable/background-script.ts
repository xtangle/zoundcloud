import {DownloadService} from '@src/download/download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {IRunnable} from '@src/runnable/runnable';
import {ScPageObservables} from '@src/runnable/sc-page-observables';
import {logger} from '@src/util/logger';
import {fromEventPattern, Observable, Subscription} from 'rxjs';
import WebNavigationUrlCallbackDetails = chrome.webNavigation.WebNavigationUrlCallbackDetails;

export class BackgroundScript implements IRunnable {

  private onSuspend$: Observable<any> = fromEventPattern<any>(
    (handler: () => void) => chrome.runtime.onSuspend.addListener(handler));
  private subscriptions: Subscription = new Subscription();

  public cleanUp(): void {
    logger.debug('Unloading background script');
    this.subscriptions.unsubscribe();
  }

  public run(): void {
    this.subscriptions.add(this.onSuspend$.subscribe(() => this.cleanUp()));
    this.subscriptions.add(
      ScPageObservables.scPageVisited$().subscribe((details: WebNavigationUrlCallbackDetails) => {
        logger.debug('Loading content script', details);
        chrome.tabs.insertCSS(details.tabId, {file: 'styles.css'});
        chrome.tabs.executeScript(details.tabId, {file: 'vendor.js'});
        chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
      })
    );
    this.subscriptions.add(
      ExtensionMessenger.onMessage(RequestContentPageReloadMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<RequestContentPageReloadMessage>) => {
          ExtensionMessenger.sendToContentPage(args.sender.tab.id, new ReloadContentPageMessage());
        })
    );
    this.subscriptions.add(
      ExtensionMessenger.onMessage(RequestDownloadMessage.TYPE).subscribe(
        (args: IMessageHandlerArgs<RequestDownloadMessage>) => {
          DownloadService.download$(args.message.downloadInfoUrl);
        })
    );
  }
}
