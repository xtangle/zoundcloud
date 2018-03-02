import {TrackContentPage} from '@src/page/track-content-page';
import {IRunnable} from '@src/script/runnable';
import {BootstrapService} from '@src/service/bootstrap-service';

export class ContentScript implements IRunnable {
  public run(): void {
    BootstrapService.bootstrap(new TrackContentPage());
  }
}
