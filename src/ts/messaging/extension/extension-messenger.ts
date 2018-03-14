import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {MessengerImpl} from '@src/messaging/messenger';
import 'rxjs/add/observable/empty';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';

class ExtensionMessengerImpl extends MessengerImpl {
  public sendToContentPage<T extends MessageResponse = undefined>(tabId: number,
                                                                  message: Message,
                                                                  expectResponse: boolean = false): Observable<T> {
    let response$: Observable<T>;

    if (expectResponse) {
      const responseSubject$: ReplaySubject<T> = new ReplaySubject<T>(1);
      response$ = responseSubject$.asObservable();

      chrome.tabs.sendMessage(tabId, message, (response: T) => {
        if (response !== undefined) {
          responseSubject$.next(response);
          responseSubject$.complete();
        } else {
          responseSubject$.error(chrome.runtime.lastError);
        }
      });

    } else {
      response$ = Observable.empty();
      chrome.tabs.sendMessage(tabId, message);
    }

    return response$;
  }
}

export const ExtensionMessenger = new ExtensionMessengerImpl();
