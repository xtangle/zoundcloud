import {Message, MessageType} from '@src/messaging/message';

export class LogToConsoleMessage extends Message {
  public static readonly TYPE: MessageType = 'LogToConsole';
  public optionalParams: any[];

  public constructor(public message: any, ...optionalParams: any[]) {
    super(LogToConsoleMessage.TYPE, {message, optionalParams});
    this.optionalParams = optionalParams;
  }
}
