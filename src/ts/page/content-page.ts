import {UnloadContentPageMessage} from '@src/messaging/extension/unload-content-page.message';
import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {InjectionService} from '@src/page/injection/injection-service';
import {logger} from '@src/util/logger';
import {Subscription} from 'rxjs';
import {first} from 'rxjs/operators';

export class ContentPage {
  private subscriptions: Subscription = new Subscription();

  public load(): void {
    InjectionService.injectDownloadButtons(this.subscriptions);
    ContentPageMessenger.onMessage(UnloadContentPageMessage.TYPE)
      .pipe(first())
      .subscribe(this.unload.bind(this));
    logger.debug('Loaded content page');
  }

  public unload(): void {
    this.subscriptions.unsubscribe();
    logger.debug('Unloaded content page');
  }
}
