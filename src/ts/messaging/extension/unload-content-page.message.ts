import {Message, MessageType} from '@src/messaging/message';

export class UnloadContentPageMessage extends Message {
  public static readonly TYPE: MessageType = 'UnloadContentPage';

  public constructor() {
    super(UnloadContentPageMessage.TYPE);
  }
}
