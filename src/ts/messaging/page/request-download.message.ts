import {Message, MessageType} from '@src/messaging/message';

export class RequestDownloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestDownload';

  public constructor(public downloadInfoUrl: string) {
    super(RequestDownloadMessage.TYPE, downloadInfoUrl);
  }
}
