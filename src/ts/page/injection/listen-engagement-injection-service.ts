import {ZC_DL_BUTTON_MEDIUM_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {InjectionCommonsService} from '@src/page/injection/injection-commons-service';
import {InjectionSignalService} from '@src/page/injection/injection-signal-service';
import {UrlService} from '@src/util/url-service';
import {Subscription} from 'rxjs';

export const ListenEngagementInjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    const selector = 'div.listenEngagement.sc-clearfix';
    subscriptions.add(
      InjectionSignalService.getInjectionSignal$(selector)
        .subscribe(addToListenEngagement.bind(null, subscriptions))
    );
  }
};

function addToListenEngagement(subscriptions: Subscription, listenEngagement: JQuery<HTMLElement>): void {
  const currUrl = UrlService.getCurrentUrl();
  const downloadButton = DownloadButtonFactory.create(subscriptions, currUrl)
    .addClass(['sc-button-medium', ZC_DL_BUTTON_MEDIUM_CLASS]);
  const buttonGroup = listenEngagement
    .find('.listenEngagement__footer .soundActions .sc-button-group');
  InjectionCommonsService.addToButtonGroup(downloadButton, buttonGroup);
}
