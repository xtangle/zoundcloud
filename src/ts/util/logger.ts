/* tslint:disable no-console */
class Logger {
  private readonly MSG_PREFIX = 'ZC';

  public debug(message: any, ...optionalParams: any[]): void {
    ifDevEnv(() => console.debug(this.affixMessage(message), ...optionalParams));
  }

  public error(message: any, error?: ErrorEvent): void {
    if (error) {
      console.error(this.affixMessage(message), error);
    } else {
      console.error(this.affixMessage(message));
    }
  }

  private affixMessage(message: string): string {
    return `${this.MSG_PREFIX}: ${message}`;
  }
}

function ifDevEnv(action: () => void): void {
  if (process.env.NODE_ENV === 'development') {
    action();
  }
}

export const logger: Logger = new Logger();
