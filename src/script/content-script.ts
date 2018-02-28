import {TrackContentPage} from '../page/track-content-page';
import {BootstrapService} from '../service/bootstrap-service';
import {IRunnable} from './runnable';

export class ContentScript implements IRunnable {
  public run(): void {
    BootstrapService.bootstrap(new TrackContentPage());
  }
}
