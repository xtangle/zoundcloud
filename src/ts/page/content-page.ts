import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {LogToConsoleMessage} from '@src/messaging/page/log-to-console.message';
import {InjectionService} from '@src/page/injection/injection-service';
import {Subscription} from 'rxjs';

export class ContentPage {
  public subscriptions: Subscription = new Subscription();

  public load(): void {
    InjectionService.injectDownloadButtons(this.subscriptions);

    window.onbeforeunload = this.unload.bind(this);

    ContentPageMessenger.sendToExtension$(
      new LogToConsoleMessage('Loaded content page'));
  }

  public unload(): void {
    this.subscriptions.unsubscribe();

    ContentPageMessenger.sendToExtension$(
      new LogToConsoleMessage('Unloaded content page'));
  }
}
