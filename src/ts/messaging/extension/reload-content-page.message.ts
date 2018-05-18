import {Message, MessageType} from '@src/messaging/message';

export class ReloadContentPageMessage extends Message {
  public static readonly TYPE: MessageType = 'ReloadContentPage';

  public constructor(public contentPageType: string) {
    super(ReloadContentPageMessage.TYPE, contentPageType);
  }
}
