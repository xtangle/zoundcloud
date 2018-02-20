declare const ENV: string;

class Logger {
  private readonly MSG_PREFIX = 'ZC';
  public log(message?: any, ...optionalParams: any[]): void {
    ifNonProd(() => console.log(`${this.MSG_PREFIX}: ${message}`, ...optionalParams));
  }
}

function ifNonProd(action: () => void): void {
  if (ENV !== 'production') {
    action();
  }
}

export const logger: Logger = new Logger();
