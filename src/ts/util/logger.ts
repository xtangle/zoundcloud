class Logger {
  private readonly MSG_PREFIX = 'ZC';
  public log(message?: any, ...optionalParams: any[]): void {
    doIfDebug(() => console.log(`${this.MSG_PREFIX}: ${message}`, ...optionalParams));
  }
}

function doIfDebug(action: () => void): void {
  if (process.env.DEBUG) {
    action();
  }
}

export const logger: Logger = new Logger();
