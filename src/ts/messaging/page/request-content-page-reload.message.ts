import {Message, MessageType} from '@src/messaging/message';

export class RequestContentPageReloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestContentPageReload';

  public constructor(public contentPageId: string) {
    super(RequestContentPageReloadMessage.TYPE, contentPageId);
  }
}
