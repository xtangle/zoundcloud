import {ListItemInjectionService} from '@src/page/injection/list-item-injection-service';
import {ListenEngagementInjectionService} from '@src/page/injection/listen-engagement-injection-service';
import {UserInfoBarInjectionService} from '@src/page/injection/user-info-bar-injection-service';
import {Observable} from 'rxjs';

export const InjectionService = {
  injectDownloadButtons(onUnload$: Observable<any>) {
    ListenEngagementInjectionService.injectDownloadButtons(onUnload$);
    ListItemInjectionService.injectDownloadButtons(onUnload$);
    UserInfoBarInjectionService.injectDownloadButtons(onUnload$);
  }
};
