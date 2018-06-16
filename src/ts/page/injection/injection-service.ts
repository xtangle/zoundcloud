import {ListItemInjectionService} from '@src/page/injection/list-item-injection-service';
import {ListenEngagementInjectionService} from '@src/page/injection/listen-engagement-injection-service';
import {UserInfoBarInjectionService} from '@src/page/injection/user-info-bar-injection-service';
import {Subscription} from 'rxjs';

export const InjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    ListenEngagementInjectionService.injectDownloadButtons(subscriptions);
    ListItemInjectionService.injectDownloadButtons(subscriptions);
    UserInfoBarInjectionService.injectDownloadButtons(subscriptions);
  }
};
