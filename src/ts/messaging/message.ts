export type MessageType = string;

export abstract class Message {
  protected constructor(public readonly type: MessageType,
                        protected readonly content?: any) {
  }
}
