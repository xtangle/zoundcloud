import {bootstrap} from '../page/bootstrap';
import {TrackContentPage} from '../page/track-content-page';
import {IRunnable} from './runnable';

export class ContentScript implements IRunnable {
  private static bootstrap = bootstrap;

  public run(): void {
    ContentScript.bootstrap(new TrackContentPage());
  }
}
