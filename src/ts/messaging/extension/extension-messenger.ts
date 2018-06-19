import {Message} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {BaseMessenger} from '@src/messaging/messenger';
import {EMPTY, Observable, Subject} from 'rxjs';

class ExtensionMessengerImpl extends BaseMessenger {
  public sendToContentPage$<T extends MessageResponse = undefined>(tabId: number,
                                                                   message: Message,
                                                                   expectResponse: boolean = false): Observable<T> {
    let response$: Observable<T>;

    if (expectResponse) {
      const responseSubject$: Subject<T> = new Subject<T>();
      response$ = responseSubject$.asObservable();

      chrome.tabs.sendMessage(tabId, message, (response?: T) => {
        if (response !== undefined) {
          responseSubject$.next(response);
          responseSubject$.complete();
        } else {
          responseSubject$.error(chrome.runtime.lastError.message);
        }
      });

    } else {
      response$ = EMPTY;
      chrome.tabs.sendMessage(tabId, message);
    }

    return response$;
  }
}

export const ExtensionMessenger = new ExtensionMessengerImpl();
