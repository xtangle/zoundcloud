/* tslint:disable no-console */
class Logger {
  private readonly MSG_PREFIX = 'ZC';

  public debug(message: any, ...optionalParams: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.affixMessage(message), ...optionalParams);
    }
  }

  public log(message: any, ...optionalParams: any[]): void {
    console.log(this.affixMessage(message), ...optionalParams);
  }

  public error(message: any, error?: Error): void {
    if (error) {
      console.error(this.affixMessage(message), error);
    } else {
      console.error(this.affixMessage(message));
    }
  }

  private affixMessage(message: string): string {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${this.MSG_PREFIX}: ${message}`;
  }
}

export const logger = new Logger();
