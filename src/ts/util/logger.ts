/* tslint:disable no-console */
class Logger {
  private readonly MSG_PREFIX = 'ZC';
  public log(message?: any, ...optionalParams: any[]): void {
    doIfDevelopment(() => console.log(`${this.MSG_PREFIX}: ${message}`, ...optionalParams));
  }
}

function doIfDevelopment(action: () => void): void {
  if (process.env.NODE_ENV === 'development') {
    action();
  }
}

export const logger: Logger = new Logger();
