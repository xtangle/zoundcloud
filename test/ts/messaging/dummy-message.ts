import {Message, MessageType} from '@src/messaging/message';

export class DummyMessage extends Message {
  public constructor(public type: MessageType, public content?: any) {
    super(type, content);
  }
}
