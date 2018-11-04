import {Observable} from 'rxjs';
import {ListItemInjectionService} from 'src/ts/content/injection/list-item-injection-service';
import {ListenEngagementInjectionService} from 'src/ts/content/injection/listen-engagement-injection-service';
import {UserInfoBarInjectionService} from 'src/ts/content/injection/user-info-bar-injection-service';

export const InjectionService = {
  injectDownloadButtons(onUnload$: Observable<any>) {
    ListenEngagementInjectionService.injectDownloadButtons(onUnload$);
    ListItemInjectionService.injectDownloadButtons(onUnload$);
    UserInfoBarInjectionService.injectDownloadButtons(onUnload$);
  },
};
