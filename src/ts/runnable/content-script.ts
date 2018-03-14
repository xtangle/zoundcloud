import {Bootstrapper} from '@src/page/bootstrapper';
import {TrackContentPage} from '@src/page/track-content-page';
import {IRunnable} from '@src/runnable/runnable';

export class ContentScript implements IRunnable {
  public run(): void {
    Bootstrapper.bootstrap(new TrackContentPage());
  }
}
