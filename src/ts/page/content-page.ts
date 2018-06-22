import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {LogToConsoleMessage} from '@src/messaging/page/log-to-console.message';
import {InjectionService} from '@src/page/injection/injection-service';
import {AsyncSubject, Observable} from 'rxjs';

export class ContentPage {

  private readonly onUnloadSubject$ = new AsyncSubject();

  public load(): void {
    InjectionService.injectDownloadButtons(this.onUnload$);

    window.onbeforeunload = this.unload.bind(this);

    ContentPageMessenger.sendToExtension$(
      new LogToConsoleMessage('Loaded content page'));
  }

  public unload(): void {
    this.onUnloadSubject$.next(true);
    this.onUnloadSubject$.complete();

    ContentPageMessenger.sendToExtension$(
      new LogToConsoleMessage('Unloaded content page'));
  }

  public get onUnload$(): Observable<any> {
    return this.onUnloadSubject$.asObservable();
  }
}
