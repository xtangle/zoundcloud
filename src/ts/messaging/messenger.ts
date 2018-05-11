import {Message, MessageType} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {Observable, Subject} from 'rxjs';
import {first} from 'rxjs/operators';
import MessageSender = chrome.runtime.MessageSender;

export interface IMessageHandlerArgs<T extends Message, U extends MessageResponse = undefined> {
  message: T;
  sender: MessageSender;
  response$?: Subject<U>;
}

export interface IMessenger {
  onMessage(messageType: MessageType,
            sendResponse?: boolean): Observable<IMessageHandlerArgs<Message, MessageResponse>>;
}

export abstract class DefaultMessenger implements IMessenger {
  public onMessage(messageType: MessageType,
                   doSendResponse: boolean = false): Observable<IMessageHandlerArgs<Message, MessageResponse>> {

    const handlerArgs$: Subject<IMessageHandlerArgs<Message, MessageResponse>> =
      new Subject<IMessageHandlerArgs<Message, MessageResponse>>();

    if (doSendResponse) {
      const response$: Subject<MessageResponse> = new Subject<MessageResponse>();
      chrome.runtime.onMessage.addListener(
        (message: Message, sender: MessageSender, sendResponse: (response: MessageResponse) => void) => {
          if (message.type === messageType) {
            handlerArgs$.next({message, sender, response$});
            response$.pipe(first()).subscribe(sendResponse);
            return true;
          }
        }
      );

    } else {
      chrome.runtime.onMessage.addListener(
        (message: Message, sender: MessageSender) => {
          if (message.type === messageType) {
            handlerArgs$.next({message, sender});
          }
        }
      );
    }

    return handlerArgs$.asObservable();
  }
}
