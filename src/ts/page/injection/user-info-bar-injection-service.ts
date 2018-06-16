import {ZC_DL_BUTTON_MEDIUM_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {InjectionCommonsService} from '@src/page/injection/injection-commons-service';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {UrlService} from '@src/util/url-service';
import {Subscription} from 'rxjs';

export const UserInfoBarInjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    const selector = '.userInfoBar';
    subscriptions.add(
      InjectionSignalFactory.create$(selector)
        .subscribe(addToUserInfoBar.bind(null, subscriptions))
    );
  }
};

function addToUserInfoBar(subscriptions: Subscription, userInfoBar: JQuery<HTMLElement>): void {
  const USER_URL_PATTERN = /https:\/\/soundcloud.com\/[^\/]+/;
  const userInfoUrl = USER_URL_PATTERN.exec(UrlService.getCurrentUrl())[0];
  const downloadButton = DownloadButtonFactory.create(subscriptions, userInfoUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = userInfoBar.find('.sc-button-group');
  InjectionCommonsService.addToButtonGroup(downloadButton, buttonGroup);
}
