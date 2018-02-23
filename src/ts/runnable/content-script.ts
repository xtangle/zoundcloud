import {bootstrap} from '../page/bootstrap';
import {TrackContentPage} from '../page/track-content-page';
import {IRunnable} from './runnable';

export class ContentScript implements IRunnable {
  public run(): void {
    bootstrap(new TrackContentPage());
  }
}
