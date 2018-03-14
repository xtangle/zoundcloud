type IMessageResponseContent = any;

export abstract class MessageResponse {
  protected constructor(protected readonly content: IMessageResponseContent) {
  }
}
