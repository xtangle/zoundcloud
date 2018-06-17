import {ZC_DL_BUTTON_MEDIUM_CLASS} from '@src/constants';
import {DownloadButtonFactory} from '@src/page/injection/download-button-factory';
import {addToButtonGroup} from '@src/page/injection/injection-commons';
import {InjectionSignalFactory} from '@src/page/injection/injection-signal-factory';
import {UrlService} from '@src/util/url-service';
import {Subscription} from 'rxjs';

export const ListenEngagementInjectionService = {
  injectDownloadButtons(subscriptions: Subscription) {
    const selector = 'div.listenEngagement.sc-clearfix';
    subscriptions.add(
      InjectionSignalFactory.create$(selector)
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
  addToButtonGroup(downloadButton, buttonGroup);
}
