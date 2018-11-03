import {Message, MessageType} from 'src/ts/messaging/message';

export class RequestDownloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestDownload';

  public constructor(public resourceInfoUrl: string) {
    super(RequestDownloadMessage.TYPE, resourceInfoUrl);
  }
}
