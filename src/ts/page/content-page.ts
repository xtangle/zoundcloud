import {UnloadContentPageMessage} from '@src/messaging/extension/unload-content-page.message';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {DownloadPage} from '@src/page/download-page';
import {logger} from '@src/util/logger';
import {Subscription} from 'rxjs';

export class ContentPage {
  private subscriptions: Subscription;

  public load(): void {
    this.subscriptions = new Subscription();
    DownloadPage.load(this.subscriptions);
    this.subscriptions.add(
      ContentPageMessenger.onMessage(UnloadContentPageMessage.TYPE)
        .subscribe(this.unload.bind(this))
    );
    logger.debug('Loaded content page');
  }

  public unload(): void {
    this.subscriptions.unsubscribe();
    logger.debug('Unloaded content page');
  }
}
