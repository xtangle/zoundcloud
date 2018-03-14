import {Message, MessageType} from '@src/messaging/message';

export class ReloadContentPageMessage extends Message {
  public static readonly TYPE: MessageType = 'ReloadContentPage';

  public constructor(public contentPageId: string) {
    super(ReloadContentPageMessage.TYPE, contentPageId);
  }
}
