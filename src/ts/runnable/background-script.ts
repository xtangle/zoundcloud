import {DownloadService} from '@src/download/download-service';
import {ExtensionMessenger} from '@src/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from '@src/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from '@src/messaging/messenger';
import {LogToConsoleMessage} from '@src/messaging/page/log-to-console.message';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {RequestDownloadMessage} from '@src/messaging/page/request-download.message';
import {IRunnable} from '@src/runnable/runnable';
import {ScPageObservables} from '@src/runnable/sc-page-observables';
import {logger} from '@src/util/logger';
import {fromEventPattern, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export class BackgroundScript implements IRunnable {

  private onSuspend$: Observable<any> = fromEventPattern<any>(
    (handler: () => void) => chrome.runtime.onSuspend.addListener(handler));

  public run(): void {
    ScPageObservables.goToSoundCloudPage$()
      .pipe(takeUntil(this.onSuspend$))
      .subscribe((tabId: number) => {
        chrome.tabs.insertCSS(tabId, {file: 'styles.css'});
        chrome.tabs.executeScript(tabId, {file: 'vendor.js'});
        chrome.tabs.executeScript(tabId, {file: 'content.js'});
      });

    ExtensionMessenger.onMessage$(RequestContentPageReloadMessage.TYPE)
      .pipe(takeUntil(this.onSuspend$))
      .subscribe((args: IMessageHandlerArgs<RequestContentPageReloadMessage>) =>
        ExtensionMessenger.sendToContentPage$(args.sender.tab.id, new ReloadContentPageMessage())
      );

    ExtensionMessenger.onMessage$(RequestDownloadMessage.TYPE)
      .pipe(takeUntil(this.onSuspend$))
      .subscribe((args: IMessageHandlerArgs<RequestDownloadMessage>) => {
        logger.log('Downloading resource:', args.message.resourceInfoUrl);
        DownloadService.download$(args.message.resourceInfoUrl);
      });

    ExtensionMessenger.onMessage$(LogToConsoleMessage.TYPE)
      .pipe(takeUntil(this.onSuspend$))
      .subscribe((args: IMessageHandlerArgs<LogToConsoleMessage>) =>
        logger.log(`${args.message.message} (tabId: ${args.sender.tab.id})`, ...args.message.optionalParams)
      );

    logger.log('Loaded background script');
  }
}
