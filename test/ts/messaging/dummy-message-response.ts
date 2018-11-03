import {MessageResponse} from 'src/ts/messaging/message-response';

export class DummyMessageResponse extends MessageResponse {
  public constructor(public content: any) {
    super(content);
  }
}
