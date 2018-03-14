export type MessageType = string;
type MessageContent = any;

export abstract class Message {
  protected constructor(public readonly type: MessageType,
                        protected readonly content?: MessageContent) {
  }
}
