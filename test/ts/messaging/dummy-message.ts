import {Message, MessageType} from 'src/ts/messaging/message';

export class DummyMessage extends Message {
  public constructor(public type: MessageType, public content?: any) {
    super(type, content);
  }
}
