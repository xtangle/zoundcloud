import {Bootstrapper} from '@src/page/bootstrapper';
import {ContentPage} from '@src/page/content-page';
import {IRunnable} from '@src/runnable/runnable';

export class ContentScript implements IRunnable {
  public run(): void {
    Bootstrapper.bootstrap(new ContentPage());
  }
}
