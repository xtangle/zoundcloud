import {Message, MessageType} from '@src/messaging/message';
import {MessageResponse} from '@src/messaging/message-response';
import {logger} from '@src/util/logger';
import 'rxjs/add/operator/first';
import {Observable} from 'rxjs/Observable';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';
import MessageSender = chrome.runtime.MessageSender;

export interface IMessageHandlerArgs<T extends Message, U extends MessageResponse = undefined> {
  message: T;
  sender: MessageSender;
  response$?: Subject<U>;
}

export interface IMessenger {
  onMessage(messageType: MessageType, sendResponse: boolean): Observable<IMessageHandlerArgs<Message, MessageResponse>>;
}

export abstract class MessengerImpl implements IMessenger {
  public onMessage(messageType: MessageType,
                   doSendResponse: boolean = false): Observable<IMessageHandlerArgs<Message, MessageResponse>> {

    const handlerArgs$: ReplaySubject<IMessageHandlerArgs<Message, MessageResponse>> =
      new ReplaySubject<IMessageHandlerArgs<Message, MessageResponse>>(1);

    if (doSendResponse) {
      const response$: Subject<MessageResponse> = new Subject<MessageResponse>();
      chrome.runtime.onMessage.addListener(
        (message: Message, sender: MessageSender, sendResponse: (response: MessageResponse) => void) => {
          if (message.type === messageType) {
            handlerArgs$.next({message, sender, response$});
            response$.first().subscribe(sendResponse);
            return true;
          }
        }
      );

    } else {
      chrome.runtime.onMessage.addListener(
        (message: Message, sender: MessageSender) => {
          logger.log('In addListener', message.type, messageType, message.type === messageType);
          if (message.type === messageType) {
            handlerArgs$.next({message, sender});
          }
        }
      );
    }

    return handlerArgs$.asObservable();
  }
}
