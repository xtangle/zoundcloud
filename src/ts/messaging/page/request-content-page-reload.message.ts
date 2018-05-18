import {Message, MessageType} from '@src/messaging/message';

export class RequestContentPageReloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestContentPageReload';

  public constructor(public contentPageType: string) {
    super(RequestContentPageReloadMessage.TYPE, contentPageType);
  }
}
