import {InjectionService} from '@src/page/injection/injection-service';
import {logger} from '@src/util/logger';
import {Subscription} from 'rxjs';

export class ContentPage {
  public subscriptions: Subscription = new Subscription();

  public load(): void {
    InjectionService.injectDownloadButtons(this.subscriptions);
    logger.debug('Loaded content page');
  }

  public unload(): void {
    this.subscriptions.unsubscribe();
    logger.debug('Unloaded content page');
  }
}
