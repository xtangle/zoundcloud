import {EMPTY, Observable, Subject} from 'rxjs';
import {Message} from 'src/ts/messaging/message';
import {MessageResponse} from 'src/ts/messaging/message-response';
import {BaseMessenger} from 'src/ts/messaging/messenger';

class ContentPageMessengerImpl extends BaseMessenger {
  public sendToExtension$<T extends MessageResponse = undefined>(message: Message,
                                                                 expectResponse: boolean = false): Observable<T> {
    let response$: Observable<T>;

    if (expectResponse) {
      const responseSubject$: Subject<T> = new Subject<T>();
      response$ = responseSubject$.asObservable();

      chrome.runtime.sendMessage(message, (response: T) => {
        if (response !== undefined) {
          responseSubject$.next(response);
          responseSubject$.complete();
        } else {
          responseSubject$.error(chrome.runtime.lastError.message);
        }
      });

    } else {
      response$ = EMPTY;
      chrome.runtime.sendMessage(message);
    }

    return response$;
  }
}

export const ContentPageMessenger = new ContentPageMessengerImpl();
