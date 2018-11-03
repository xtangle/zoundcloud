import {Bootstrapper} from 'src/ts/content/bootstrapper';
import {ContentPage} from 'src/ts/content/content-page';
import {IRunnable} from 'src/ts/util/runnable';

export class ContentScript implements IRunnable {
  public run(): void {
    Bootstrapper.bootstrap(new ContentPage());
  }
}
