import {Message, MessageType} from 'src/ts/messaging/message';

export class ReloadContentPageMessage extends Message {
  public static readonly TYPE: MessageType = 'ReloadContentPage';

  public constructor() {
    super(ReloadContentPageMessage.TYPE);
  }
}
