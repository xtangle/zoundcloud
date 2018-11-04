import {fromEventPattern, Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ScPageObservables} from 'src/ts/background/sc-page-observables';
import {DownloadService} from 'src/ts/download/download-service';
import {ExtensionMessenger} from 'src/ts/messaging/extension/extension-messenger';
import {ReloadContentPageMessage} from 'src/ts/messaging/extension/reload-content-page.message';
import {IMessageHandlerArgs} from 'src/ts/messaging/messenger';
import {LogToConsoleMessage} from 'src/ts/messaging/page/log-to-console.message';
import {RequestContentPageReloadMessage} from 'src/ts/messaging/page/request-content-page-reload.message';
import {RequestDownloadMessage} from 'src/ts/messaging/page/request-download.message';
import {logger} from 'src/ts/util/logger';
import {IRunnable} from 'src/ts/util/runnable';

const openOptionsPage = () => chrome.runtime.openOptionsPage();

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

        chrome.pageAction.show(tabId);
        chrome.pageAction.onClicked.removeListener(openOptionsPage);
        chrome.pageAction.onClicked.addListener(openOptionsPage);
      });

    ExtensionMessenger.onMessage$(RequestContentPageReloadMessage.TYPE)
      .pipe(takeUntil(this.onSuspend$))
      .subscribe((args: IMessageHandlerArgs<RequestContentPageReloadMessage>) =>
        ExtensionMessenger.sendToContentPage$(args.sender.tab.id, new ReloadContentPageMessage()),
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
        logger.log(`${args.message.message} (tabId: ${args.sender.tab.id})`, ...args.message.optionalParams),
      );

    logger.log('Loaded background script');
  }
}
