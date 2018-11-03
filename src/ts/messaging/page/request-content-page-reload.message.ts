import {Message, MessageType} from 'src/ts/messaging/message';

export class RequestContentPageReloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestContentPageReload';

  public constructor() {
    super(RequestContentPageReloadMessage.TYPE);
  }
}
