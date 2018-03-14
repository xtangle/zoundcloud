import {ITrackInfo} from '@src/download/download-info';
import {Message, MessageType} from '@src/messaging/message';

export class RequestTrackDownloadMessage extends Message {
  public static readonly TYPE: MessageType = 'RequestTrackDownload';

  public constructor(public trackInfo: ITrackInfo) {
    super(RequestTrackDownloadMessage.TYPE, trackInfo);
  }
}
